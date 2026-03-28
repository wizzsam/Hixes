1.2 Alcance del sistema
El sistema debera gestionar de forma automatica y centralizada:
•	El registro de clientes y su historial de consumo
•	La generacion y uso de saldo Wallet (dinero adelantado + bono)
•	La generacion y uso de saldo Cashback (porcentaje sobre consumo)
•	El avance de niveles de fidelizacion del cliente
•	Las notificaciones al cliente via WhatsApp/SMS
•	El panel de administracion para recepcion

1.3 Definiciones clave
Termino	Definicion
Wallet HEXIS	Saldo adelantado que el cliente recarga y al que HEXIS agrega un bono segun escala. Vigencia 12 meses.
Cashback HEXIS	Saldo promocional generado automaticamente como porcentaje del servicio consumido. Vigencia segun nivel.
Bono Wallet	Porcentaje adicional que HEXIS agrega sobre la recarga del cliente, segun el monto recargado.
Nivel	Categoria del cliente (Origen, Armonia, Balance, Privilege) determinada por consumo acumulado en 12 meses.
Consumo acumulado	Suma de todos los servicios pagados por el cliente en los ultimos 12 meses.
Recepcion	Personal de HEXIS que opera el sistema para registrar visitas, recargas y pagos.

2. Descripcion General del Sistema
2.1 Modulos del sistema
El sistema se compone de dos programas independientes pero compatibles que conviven en la misma plataforma:

Modulo	Que genera	Trigger	Vigencia
Wallet HEXIS	Saldo adelantado + bono	Cliente deja dinero por adelantado	12 meses
Cashback HEXIS	Porcentaje sobre consumo	Cliente paga un servicio	30 a 90 dias (segun nivel)

2.2 Flujo general del sistema
El flujo operativo correcto es el siguiente:

Durante la visita actual:
1.	Si el cliente CONSUME un servicio → el sistema genera Cashback automaticamente
2.	Si el cliente DEJA dinero adelantado → el dinero entra a Wallet y se agrega el bono segun escala
3.	Si hace ambas cosas → se generan ambos saldos de forma independiente

En la proxima visita (al momento de pagar):
4.	El sistema descuenta primero del saldo Wallet
5.	Luego aplica el saldo Cashback si aun hay monto pendiente

3. Requerimientos Funcionales
3.1 Gestion de Clientes

RF-01	Registro de cliente
Prioridad	Alta
Descripcion	El sistema debe permitir registrar un nuevo cliente con: nombre completo, numero de DNI y numero telefonico. El numero de telefono sera el identificador principal del cliente.

RF-02	Consulta de perfil del cliente
Prioridad	Alta
Descripcion	El sistema debe mostrar en pantalla el perfil completo del cliente al buscar por telefono o DNI, incluyendo: nivel actual, saldo Wallet, saldo Cashback, fecha de vencimiento de cada saldo y consumo acumulado en los ultimos 12 meses.

RF-03	Historial de transacciones
Prioridad	Media
Descripcion	El sistema debe registrar y mostrar el historial completo de visitas, recargas, consumos y usos de saldo de cada cliente.

3.2 Modulo Cashback

RF-04	Generacion automatica de cashback
Prioridad	Alta
Descripcion	Al registrar el consumo de un servicio, el sistema debe calcular y acreditar automaticamente el cashback segun el nivel actual del cliente. Formula: Cashback = Monto del servicio x % del nivel.

RF-05	Calculo de nivel de cashback
Prioridad	Alta
Descripcion	El porcentaje de cashback aplicado debe corresponder al nivel del cliente calculado sobre el consumo acumulado de los ultimos 12 meses, segun la siguiente escala:

Nivel	Consumo acumulado (12 meses)	% Cashback	Vigencia del saldo
ORIGEN	S/0 - S/999	3%	30 dias
ARMONIA	S/1,000 - S/2,499	5%	45 dias
BALANCE	S/2,500 - S/4,999	7%	60 dias
PRIVILEGE	S/5,000 a mas	8%	90 dias

RF-06	Vencimiento automatico del cashback
Prioridad	Alta
Descripcion	El sistema debe eliminar automaticamente el saldo de cashback al cumplirse su plazo de vigencia, segun el nivel del cliente. El vencimiento se cuenta desde la fecha de generacion del cashback.

RF-07	Restriccion de uso del cashback
Prioridad	Alta
Descripcion	El cashback generado en una visita solo puede utilizarse a partir de la visita siguiente. No puede aplicarse en la misma visita en que se genera. El cashback no es acumulable con promociones especiales.

3.3 Modulo Wallet

RF-08	Registro de recarga Wallet
Prioridad	Alta
Descripcion	El sistema debe registrar recargas de saldo Wallet iniciadas por el cliente. Al registrar la recarga, debe calcular y agregar automaticamente el bono HEXIS segun el monto recargado.

RF-09	Calculo del bono Wallet
Prioridad	Alta
Descripcion	El bono se calcula sobre el monto que el cliente recarga, segun la siguiente escala:

Monto recargado	Bono HEXIS	Beneficio
S/1 - S/299	3%	Incentivo inicial
S/300 - S/499	5%	Cliente frecuente
S/500 - S/999	8%	Cliente recurrente
S/1,000 - S/1,999	10%	Cliente premium
S/2,000 a mas	12%	Cliente VIP

RF-10	Saldo total Wallet
Prioridad	Alta
Descripcion	El saldo total acreditado en Wallet debe ser igual al monto recargado por el cliente mas el bono HEXIS correspondiente. Formula: Saldo Wallet = Monto recargado + (Monto recargado x % bono).

RF-11	Vencimiento del Wallet
Prioridad	Alta
Descripcion	El saldo en Wallet tiene una vigencia maxima de 12 meses desde la fecha de recarga. Al vencerse el plazo, el saldo restante debe eliminarse automaticamente del sistema.

RF-12	El bono no genera cashback
Prioridad	Alta
Descripcion	El bono otorgado por HEXIS sobre la recarga Wallet no constituye consumo y por lo tanto no genera cashback. El cashback solo se genera sobre servicios efectivamente consumidos.

3.4 Uso de Saldos al Momento de Pagar

RF-13	Orden de aplicacion de saldos
Prioridad	Alta
Descripcion	Cuando el cliente tenga saldos disponibles al momento de pagar, el sistema debe aplicarlos en el siguiente orden obligatorio: 1ro) Wallet HEXIS, 2do) Cashback acumulado. Este orden no puede ser modificado manualmente.

RF-14	Descuento parcial del Wallet
Prioridad	Alta
Descripcion	Si el saldo Wallet es menor al costo del servicio, el sistema debe descontar todo el Wallet disponible y el saldo restante puede pagarse en efectivo u otro medio. Luego aplica el cashback si hay.

RF-15	Limite de uso de cashback por visita
Prioridad	Media
Descripcion	El cashback puede usarse como descuento parcial en el servicio. El sistema debe respetar que el cashback no puede superar el 30% del valor total del servicio por visita.

3.5 Sistema de Niveles

RF-16	Calculo automatico del nivel
Prioridad	Alta
Descripcion	El nivel del cliente debe recalcularse automaticamente cada vez que se registra un nuevo consumo. El nivel se determina por el consumo acumulado en los ultimos 12 meses calendario.

RF-17	Subida de nivel
Prioridad	Alta
Descripcion	Cuando el consumo acumulado del cliente supere el umbral de un nivel superior, el sistema debe actualizar su nivel automaticamente y aplicar el nuevo porcentaje de cashback en las siguientes transacciones.

RF-18	Calculo de progreso hacia siguiente nivel
Prioridad	Media
Descripcion	El sistema debe calcular y mostrar cuanto le falta al cliente para subir al siguiente nivel. Ejemplo: 'Te faltan S/X para subir a [Nivel]'.

3.6 Notificaciones al Cliente

RF-19	Mensaje de confirmacion post-visita
Prioridad	Alta
Descripcion	Al finalizar cada transaccion (consumo o recarga), el sistema debe generar automaticamente un mensaje de resumen para enviar al cliente via WhatsApp o SMS con el siguiente contenido:

El mensaje debe incluir:
•	Servicio realizado y monto
•	Cashback generado (si aplica)
•	Saldo Wallet actual (si tiene)
•	Nivel actual y % de cashback
•	Vigencia de los saldos
•	Progreso hacia el siguiente nivel

RF-20	Alerta de vencimiento proximo
Prioridad	Media
Descripcion	El sistema debe generar una alerta o notificacion cuando el cashback o wallet de un cliente este proximo a vencer (sugerido: 5 dias antes del vencimiento).

3.7 Panel de Administracion para Recepcion

RF-21	Registro de servicio consumido
Prioridad	Alta
Descripcion	El personal de recepcion debe poder registrar el servicio que el cliente acaba de consumir, especificando el nombre del servicio y el monto. El sistema calcula el cashback automaticamente.

RF-22	Registro de recarga Wallet
Prioridad	Alta
Descripcion	El personal debe poder registrar una recarga Wallet del cliente, especificando el monto. El sistema calcula y aplica el bono automaticamente.

RF-23	Registro de pago usando saldos
Prioridad	Alta
Descripcion	Al registrar el pago de un servicio, el sistema debe mostrar el saldo disponible del cliente (Wallet y Cashback) y aplicarlos automaticamente en el orden correcto.

RF-24	Busqueda de cliente
Prioridad	Alta
Descripcion	El sistema debe permitir buscar un cliente por numero de telefono o DNI para acceder rapidamente a su perfil durante la atencion.

3.8 Cancelaciones y Ajustes

RF-25	Reversion de transacciones
Prioridad	Alta
Descripcion	En caso de cancelacion de servicio, devolucion o error de facturacion, el sistema debe permitir revertir la transaccion y ajustar los saldos de Cashback y Wallet generados.

4. Requerimientos No Funcionales

ID	Categoria	Requerimiento
RNF-01	Disponibilidad	El sistema debe estar disponible durante el horario operativo de HEXIS (minimo 99% de uptime en horario de atencion).
RNF-02	Rendimiento	Las consultas de perfil de cliente y registro de transacciones deben responder en menos de 2 segundos.
RNF-03	Seguridad	El acceso al sistema debe requerir autenticacion con usuario y contrasena. Los datos del cliente son confidenciales.
RNF-04	Usabilidad	La interfaz para recepcion debe ser simple e intuitiva. El personal debe poder completar un registro en menos de 1 minuto.
RNF-05	Confiabilidad	El calculo de saldos, bonos y cashback debe ser exacto al centimo. Toda transaccion debe quedar registrada con fecha, hora y usuario.
RNF-06	Escalabilidad	El sistema debe soportar el crecimiento de la base de clientes sin degradacion del rendimiento.
RNF-07	Auditoria	Todas las operaciones sobre saldos deben generar un registro de auditoria que no pueda eliminarse.
RNF-08	Compatibilidad	El sistema debe ser accesible desde computadora de escritorio y dispositivos moviles (tablet) para uso en recepcion.

5. Reglas de Negocio

5.1 Reglas del Cashback
•	El cashback se genera UNICAMENTE sobre el valor real del servicio consumido.
•	NO se calcula sobre bonos promocionales del Wallet ni sobre descuentos ya aplicados.
•	El cashback solo puede usarse en la visita siguiente, nunca en la misma visita en que se genera.
•	El cashback no es transferible ni canjeable por efectivo.
•	Al vencer el plazo, el saldo de cashback se elimina automaticamente sin posibilidad de recuperacion.
•	El cashback no es acumulable con promociones especiales de HEXIS.

5.2 Reglas del Wallet
•	El Wallet se activa cuando el cliente deja dinero adelantado voluntariamente.
•	El bono que HEXIS agrega forma parte del saldo Wallet y no puede retirarse como efectivo.
•	El saldo Wallet (incluyendo bono) tampoco es transferible a terceros.
•	La recarga de Wallet NO genera cashback porque no hay consumo.
•	El Wallet tiene vigencia de 12 meses desde la fecha de recarga.

5.3 Reglas de Orden de Pago
•	SIEMPRE se aplica primero el Wallet y luego el Cashback. Este orden es automatico e inalterable.
•	Si el Wallet cubre el total del servicio, el Cashback no se toca.
•	Si el Wallet no alcanza, se descuenta todo el Wallet y el resto puede pagarse con Cashback o efectivo.

5.4 Reglas de Nivel
•	El nivel se calcula en base al consumo acumulado en los ULTIMOS 12 MESES (ventana movil).
•	El consumo solo incluye servicios pagados, no el saldo de recargas Wallet.
•	El nivel se actualiza automaticamente al registrar cada nuevo consumo.
•	HEXIS se reserva el derecho de modificar porcentajes, niveles y beneficios sin previo aviso.

6. Casos de Uso Principales

CU	Nombre	Actor	Descripcion resumida
CU-01	Registrar nuevo cliente	Recepcion	Ingresa nombre, DNI y telefono del cliente para crear su perfil en el sistema.
CU-02	Registrar consumo de servicio	Recepcion	Registra el servicio que el cliente acaba de recibir y el sistema genera el cashback automaticamente.
CU-03	Registrar recarga Wallet	Recepcion	Registra el monto que el cliente deja adelantado y el sistema aplica el bono correspondiente.
CU-04	Registrar pago con saldos	Recepcion	Al momento del pago, el sistema muestra los saldos disponibles y los aplica en orden (Wallet > Cashback).
CU-05	Consultar perfil de cliente	Recepcion	Busca un cliente por telefono o DNI y visualiza su nivel, saldos, vencimientos y progreso.
CU-06	Enviar mensaje de resumen	Sistema	Al finalizar la transaccion, el sistema genera y envia automaticamente el mensaje de resumen al cliente.
CU-07	Revertir transaccion	Recepcion / Admin	Revierte una transaccion incorrecta y ajusta los saldos afectados.
CU-08	Visualizar reporte de clientes	Administrador	Accede a reportes de consumo, niveles, saldos vigentes y clientes proximos a vencer.

7. Escenarios de Ejemplo

Escenario A: Visita con consumo y recarga
Paso	Accion	Resultado en sistema
1	Cliente paga Ritual Sensaciones S/380	Cashback generado: S/380 x 3% = S/11.40 (vence en 30 dias)
2	Cliente decide dejar S/380 de recarga	Bono 5%: S/19 | Saldo Wallet: S/399 (vence en 12 meses)
3	Sistema envia mensaje a cliente	Resumen con cashback, wallet, nivel ORIGEN y progreso

Escenario B: Segunda visita usando saldo
Paso	Accion	Resultado en sistema
1	Cliente llega 1 mes despues (mayo)	Sistema detecta: Wallet S/399, Cashback S/11.40
2	Cliente consume Ritual S/380	Wallet: 399 - 380 = S/19 restante | Cashback intacto: S/11.40
3	Nuevo cashback generado	S/380 x 3% = S/11.40 | Cashback de abril ya vencio (30 dias)
4	Estado final	Wallet: S/19 | Cashback nuevo: S/11.40

Escenario C: Tercera visita con Wallet insuficiente
Paso	Accion	Resultado en sistema
1	Cliente llega en junio, Wallet = S/268	Sistema aplica S/268 del Wallet
2	Servicio cuesta S/380	Diferencia: S/112 se paga en efectivo | Wallet queda en 0
3	Nuevo cashback generado	S/380 x 3% = S/11.40 | Cashback anterior ya vencio
4	Cliente recarga S/500	Bono 8% = S/40 | Nuevo Wallet: S/540
5	Estado final	Wallet: S/540 | Cashback: S/11.40

8. Modelo de Datos (Entidades Principales)

8.1 Cliente
Campo	Tipo	Descripcion
id_cliente	UUID	Identificador unico del cliente
nombre_completo	Texto	Nombre y apellidos del cliente
dni	Texto (8)	Documento Nacional de Identidad
telefono	Texto	Numero de celular (identificador principal)
nivel_actual	Enum	ORIGEN | ARMONIA | BALANCE | PRIVILEGE
consumo_acumulado_12m	Decimal	Suma de consumos en los ultimos 12 meses
fecha_registro	Fecha/Hora	Fecha en que se registro el cliente

8.2 Saldo Wallet
Campo	Tipo	Descripcion
id_wallet	UUID	Identificador unico del registro
id_cliente	UUID	Referencia al cliente
monto_recargado	Decimal	Monto que el cliente deposito
bono_aplicado	Decimal	Bono HEXIS calculado y acreditado
saldo_disponible	Decimal	Monto actual disponible para usar
fecha_recarga	Fecha/Hora	Fecha de la recarga
fecha_vencimiento	Fecha/Hora	Fecha limite de uso (recarga + 12 meses)
estado	Enum	ACTIVO | VENCIDO | AGOTADO

8.3 Saldo Cashback
Campo	Tipo	Descripcion
id_cashback	UUID	Identificador unico del registro
id_cliente	UUID	Referencia al cliente
monto_cashback	Decimal	Monto de cashback generado
porcentaje_aplicado	Decimal	% usado para el calculo
consumo_origen	Decimal	Monto del servicio que genero el cashback
fecha_generacion	Fecha/Hora	Fecha en que se genero
fecha_vencimiento	Fecha/Hora	Fecha limite de uso
estado	Enum	PENDIENTE | USADO | VENCIDO

8.4 Transaccion
Campo	Tipo	Descripcion
id_transaccion	UUID	Identificador unico
id_cliente	UUID	Referencia al cliente
tipo	Enum	CONSUMO | RECARGA_WALLET | PAGO | REVERSION
monto	Decimal	Monto de la operacion
wallet_usado	Decimal	Monto descontado del Wallet (si aplica)
cashback_usado	Decimal	Monto descontado del Cashback (si aplica)
efectivo_cobrado	Decimal	Monto pagado en efectivo u otro medio
id_usuario_registro	UUID	Usuario de recepcion que registro la transaccion
fecha_hora	Fecha/Hora	Timestamp exacto de la operacion

9. Restricciones y Consideraciones
•	El saldo Wallet y el Cashback son unicamente para uso interno en HEXIS. No pueden retirarse como efectivo ni transferirse.
•	HEXIS se reserva el derecho de modificar porcentajes, niveles y beneficios en cualquier momento.
•	El sistema debe manejar correctamente los casos en que el cashback anterior ya vencio al momento de la siguiente visita.
•	Si un cliente recarga Wallet en la misma visita en que consume, se generan ambos saldos de forma independiente.
•	El sistema debe distinguir claramente entre consumo (genera cashback) y recarga (genera wallet + bono).
•	Los terminos y condiciones deben estar disponibles en el sistema para referencia del personal.
