<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// ─── Cron: revisar recordatorios de tareas cada minuto ─────────────────────
// En producción asegúrate de tener en crontab:
//   * * * * * php /ruta/proyecto/artisan schedule:run >> /dev/null 2>&1
Schedule::command('tareas:recordatorios')->everyMinute();

// ─── Cron: recordatorios de cashback por vencer (una vez al día a las 9am) ──
Schedule::command('cashback:recordatorios')->dailyAt('09:00')->withoutOverlapping();

// ─── Cron: recordatorios de campañas (una vez al día a las 10am) ─────────────
Schedule::command('campana:recordatorios')->dailyAt('10:00')->withoutOverlapping();
