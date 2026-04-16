<?php

namespace App\Console\Commands;

use App\Models\Tarea;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;

class EnviarRecordatoriosTareas extends Command
{
    protected $signature   = 'tareas:recordatorios';
    protected $description = 'Dispara recordatorios para tareas cuyo aviso está por vencer';

    public function handle(): int
    {
        $ahora = Carbon::now();

        // Busca tareas pendientes, no notificadas, donde la hora de aviso
        // (fecha_vencimiento - minutos_aviso) sea <= ahora y aún no venció
        $tareas = Tarea::where('estado', 'pendiente')
            ->where('notificado', false)
            ->whereRaw('DATE_SUB(fecha_vencimiento, INTERVAL minutos_aviso MINUTE) <= ?', [$ahora])
            ->get();

        foreach ($tareas as $tarea) {
            $this->dispararRecordatorio($tarea);

            $tarea->update(['notificado' => true]);
        }

        $this->info("Recordatorios procesados: {$tareas->count()}");

        return self::SUCCESS;
    }

    private function dispararRecordatorio(Tarea $tarea): void
    {
        // ─── Notificación de Base de Datos / Email ─────────────────────────────
        // Si más adelante tienes una Notification de Laravel, invócala aquí:
        //   $tarea->asignado?->notify(new RecordatorioTareaNotification($tarea));

        // Por ahora registramos en el log (puedes extender con email/push/WhatsApp)
        Log::info('Recordatorio de tarea', [
            'tarea_id'          => $tarea->id,
            'titulo'            => $tarea->titulo,
            'fecha_vencimiento' => $tarea->fecha_vencimiento,
            'asignado_a'        => $tarea->asignado_a,
        ]);
    }
}
