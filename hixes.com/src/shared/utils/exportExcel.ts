// src/shared/utils/exportExcel.ts
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const COLOR = {
  darkNavy:  'FF0F172A',
  midSlate:  'FF1E293B',
  accent:    'FF6366F1',
  headerBg:  'FF334155',
  rowAlt:    'FFF8FAFC',
  white:     'FFFFFFFF',
  green:     'FF16A34A',
  red:       'FFDC2626',
  amber:     'FFD97706',
  blue:      'FF2563EB',
  emerald:   'FF059669',
  textMain:  'FF0F172A',
  textMuted: 'FF64748B',
};

const TX_LABELS: Record<string, string> = {
  consumo:           'Consumo',
  recarga_wallet:    'Recarga',
  pago_saldo:        'Pago Saldo',
  cashback:          'Cashback',
  cashback_expirado: 'EXPIRADO',
  wallet_expirado:   'EXPIRADO',
};

const parseFecha = (raw: string | undefined | null) => {
  if (!raw) return '';
  const d = new Date(raw.includes('T') ? raw : raw + 'T00:00:00');
  return isNaN(d.getTime())
    ? raw
    : d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
};

// ─── Tipos ──────────────────────────────────────────────────────
export interface ExportClienteInfo {
  nombre_completo:    string;
  dni:                string;
  telefono:           string;
  consumo_acumulado:  number | string;
  nivelNombre:        string;
}

export interface ExportTransaccion {
  id:          number;
  tipo:        string;
  descripcion: string;
  monto:       number;
  fecha:       string;
  vence_at?:   string;
  expirado?:   boolean;
}

// ─── Función principal ───────────────────────────────────────────
export const exportarHistorialExcel = async (
  cliente: ExportClienteInfo,
  transacciones: ExportTransaccion[]
): Promise<void> => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'HEXIS';

  const ws = workbook.addWorksheet('Historial', {
    pageSetup: { fitToPage: true, orientation: 'landscape' },
  });

  ws.columns = [
    { key: 'fecha',       width: 14 },
    { key: 'operacion',   width: 14 },
    { key: 'descripcion', width: 48 },
    { key: 'efectivo',    width: 14 },
    { key: 'wallet',      width: 14 },
    { key: 'cashback',    width: 14 },
    { key: 'total',       width: 16 },
  ];

  // ── Fila 1: banda decorativa ────────────────────────────────
  ws.mergeCells('A1:G1');
  ws.getRow(1).height = 6;
  ws.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR.accent } };

  // ── Fila 2: título ──────────────────────────────────────────
  ws.mergeCells('A2:G2');
  const titleRow = ws.getRow(2);
  titleRow.height = 36;
  const titleCell = ws.getCell('A2');
  titleCell.value = `REPORTE DE MOVIMIENTOS — ${cliente.nombre_completo.toUpperCase()}`;
  titleCell.font  = { bold: true, size: 16, color: { argb: COLOR.white }, name: 'Calibri' };
  titleCell.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR.darkNavy } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

  // ── Fila 3: info cliente ────────────────────────────────────
  ws.mergeCells('A3:G3');
  const infoRow = ws.getRow(3);
  infoRow.height = 22;
  const infoCell = ws.getCell('A3');
  infoCell.value = `DNI: ${cliente.dni}   ·   TEL: ${cliente.telefono}   ·   NIVEL: ${cliente.nivelNombre}   ·   Consumo Acumulado: S/ ${parseFloat(String(cliente.consumo_acumulado)).toFixed(2)}`;
  infoCell.font  = { size: 10, color: { argb: COLOR.white }, italic: true, name: 'Calibri' };
  infoCell.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR.midSlate } };
  infoCell.alignment = { horizontal: 'center', vertical: 'middle' };

  // ── Fila 4: spacer ──────────────────────────────────────────
  ws.getRow(4).height = 6;

  // ── Fila 5: cabecera tabla ──────────────────────────────────
  const HEADERS = ['FECHA', 'OPERACIÓN', 'DESCRIPCIÓN', 'EFECTIVO', 'WALLET', 'CASHBACK', 'MONTO TOTAL'];
  const headerRow = ws.getRow(5);
  headerRow.height = 28;
  HEADERS.forEach((h, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.value = h;
    cell.font  = { bold: true, size: 10, color: { argb: COLOR.white }, name: 'Calibri' };
    cell.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR.headerBg } };
    cell.alignment = { horizontal: i >= 3 ? 'right' : i === 2 ? 'left' : 'center', vertical: 'middle' };
    cell.border = {
      top:    { style: 'medium', color: { argb: COLOR.accent } },
      bottom: { style: 'medium', color: { argb: COLOR.accent } },
      left:   { style: 'thin',   color: { argb: 'FF475569' } },
      right:  { style: 'thin',   color: { argb: 'FF475569' } },
    };
  });

  // ── Filas de datos ──────────────────────────────────────────
  transacciones.forEach((tx, idx) => {
    const isAlt    = idx % 2 === 1;
    const isCargo   = tx.tipo === 'pago_saldo' || tx.tipo === 'consumo' || tx.tipo === 'cashback_expirado' || tx.tipo === 'wallet_expirado';
    let walletDescontado = 0, cashbackDescontado = 0, efectivoPagado = 0;

    if (tx.tipo === 'pago_saldo') {
      const wMatch = tx.descripcion.match(/Wallet: -S\/([0-9.]+)/);
      const cMatch = tx.descripcion.match(/Cashback: -S\/([0-9.]+)/);
      if (wMatch) walletDescontado   = parseFloat(wMatch[1]);
      if (cMatch) cashbackDescontado = parseFloat(cMatch[1]);
      efectivoPagado = tx.monto - walletDescontado - cashbackDescontado;
    } else if (tx.tipo === 'consumo') {
      efectivoPagado = tx.monto;
    }

    const walletVal   = tx.tipo === 'recarga_wallet'  ? tx.monto
                       : tx.tipo === 'wallet_expirado'  ? -tx.monto
                       : (walletDescontado   ? -walletDescontado   : null);
    const cashbackVal = tx.tipo === 'cashback'          ? tx.monto
                       : tx.tipo === 'cashback_expirado' ? -tx.monto
                       : (cashbackDescontado ? -cashbackDescontado : null);
    const totalVal    = (isCargo ? -1 : 1) * tx.monto;

    const dataRow = ws.addRow({
      fecha:       parseFecha(tx.fecha),
      operacion:   TX_LABELS[tx.tipo] || tx.tipo,
      descripcion: tx.descripcion,
      efectivo:    efectivoPagado || null,
      wallet:      walletVal,
      cashback:    cashbackVal,
      total:       totalVal,
    });

    dataRow.height = 20;
    const rowFill: ExcelJS.Fill = {
      type: 'pattern', pattern: 'solid',
      fgColor: { argb: isAlt ? COLOR.rowAlt : COLOR.white },
    };

    dataRow.eachCell({ includeEmpty: true }, (cell, colNum) => {
      cell.fill      = rowFill;
      cell.font      = { size: 9.5, name: 'Calibri', color: { argb: COLOR.textMain } };
      cell.alignment = { vertical: 'middle', horizontal: colNum >= 4 ? 'right' : colNum === 1 ? 'center' : 'left' };
      cell.border    = {
        top:    { style: 'hair', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'hair', color: { argb: 'FFE2E8F0' } },
        left:   { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right:  { style: 'thin', color: { argb: 'FFE2E8F0' } },
      };
    });

    (['efectivo', 'wallet', 'cashback', 'total'] as const).forEach(key => {
      dataRow.getCell(key).numFmt = '"S/ " #,##0.00';
    });

    const badgeColors: Record<string, string> = {
      recarga_wallet:    COLOR.amber,
      pago_saldo:        COLOR.blue,
      cashback:          COLOR.emerald,
      consumo:           '666B7280',
      cashback_expirado: COLOR.red,
      wallet_expirado:   COLOR.red,
    };
    dataRow.getCell('operacion').font = { size: 9.5, bold: true, name: 'Calibri', color: { argb: badgeColors[tx.tipo] ?? COLOR.textMuted } };

    if (walletVal   !== null) dataRow.getCell('wallet').font   = { size: 9.5, bold: true, name: 'Calibri', color: { argb: walletVal   > 0 ? COLOR.blue  : COLOR.red } };
    if (cashbackVal !== null) dataRow.getCell('cashback').font = { size: 9.5, bold: true, name: 'Calibri', color: { argb: cashbackVal > 0 ? COLOR.green : COLOR.red } };
    dataRow.getCell('total').font = { size: 10, bold: true, name: 'Calibri', color: { argb: isCargo ? COLOR.red : COLOR.green } };
  });

  // ── Fila de totales ─────────────────────────────────────────
  const totalGeneral = transacciones.reduce((acc, tx) => {
    const isCargo = tx.tipo === 'pago_saldo' || tx.tipo === 'consumo' || tx.tipo === 'cashback_expirado' || tx.tipo === 'wallet_expirado';
    return acc + (isCargo ? -1 : 1) * tx.monto;
  }, 0);

  const totalRow = ws.addRow({
    fecha: '', operacion: '', descripcion: 'TOTAL',
    efectivo: null, wallet: null, cashback: null, total: totalGeneral,
  });
  totalRow.height = 24;
  totalRow.eachCell({ includeEmpty: true }, cell => {
    cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR.darkNavy } };
    cell.font      = { bold: true, size: 10, color: { argb: COLOR.white }, name: 'Calibri' };
    cell.alignment = { horizontal: 'right', vertical: 'middle' };
  });
  totalRow.getCell('total').numFmt = '"S/ " #,##0.00';

  // ── Banda final decorativa ──────────────────────────────────
  const footerRow = ws.addRow([]);
  ws.mergeCells(`A${footerRow.number}:G${footerRow.number}`);
  footerRow.height = 6;
  footerRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR.accent } };

  ws.views = [{ state: 'frozen', ySplit: 5, xSplit: 0 }];

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), `Historial_${cliente.nombre_completo.replace(/ /g, '_')}.xlsx`);
};