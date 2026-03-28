<?php

namespace App\DTOs\Nivel;

class CrearNivelDTO
{
    public function __construct(
        public string $nombre,
        public float $cashback_porcentaje,
        public int $vigencia_dias,
        public float $consumo_minimo,
        public ?string $color,
        public ?string $icono,
        public array $empresa_ids // IDs para la tabla intermedia hixes.empresa_nivel
    ) {}

    public static function fromRequest($request): self
    {
        $data = $request->validated();

        return new self(
            $data['nombre'],
            (float) $data['cashback_porcentaje'],
            (int) $data['vigencia_dias'],
            (float) $data['consumo_minimo'],
            $data['color'] ?? null,
            $data['icono'] ?? null,
            $data['empresa_ids'] ?? []
        );
    }
}