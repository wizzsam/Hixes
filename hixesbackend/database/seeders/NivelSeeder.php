<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Empresa;

class NivelSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $empresa = Empresa::first();
        if (!$empresa) {
            $this->command->warn('No hay empresas registradas para asignar niveles. Crea una empresa primero.');
            return;
        }

        $niveles = [
            [
                'empresa_id' => $empresa->id,
                'nombre' => 'ORIGEN',
                'cashback_porcentaje' => 3.00,
                'vigencia_dias' => 30,
                'consumo_minimo' => 0.00,
                'color' => 'text-slate-800',
                'icono' => '🌱',
            ],
            [
                'empresa_id' => $empresa->id,
                'nombre' => 'ARMONIA',
                'cashback_porcentaje' => 5.00,
                'vigencia_dias' => 45,
                'consumo_minimo' => 1000.00,
                'color' => 'text-rose-500',
                'icono' => '🌸',
            ],
            [
                'empresa_id' => $empresa->id,
                'nombre' => 'BALANCE',
                'cashback_porcentaje' => 7.00,
                'vigencia_dias' => 60,
                'consumo_minimo' => 2500.00,
                'color' => 'text-emerald-500',
                'icono' => '🌿',
            ],
            [
                'empresa_id' => $empresa->id,
                'nombre' => 'PRIVILEGE',
                'cashback_porcentaje' => 8.00,
                'vigencia_dias' => 90,
                'consumo_minimo' => 5000.00,
                'color' => 'text-amber-500',
                'icono' => '👑',
            ],
        ];

        foreach ($niveles as $nivel) {
            DB::table('niveles')->updateOrInsert(
                ['empresa_id' => $empresa->id, 'nombre' => $nivel['nombre']],
                $nivel
            );
        }
    }
}
