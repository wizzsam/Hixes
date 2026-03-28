<?php

namespace App\DTOs\Nivel;

class ActualizarNivelDTO
{
    public function __construct(
        public ?string $nombre = null,
        public ?float $cashback_porcentaje = null,
        public ?int $vigencia_dias = null,
        public ?float $consumo_minimo = null,
        public ?string $color = null,
        public ?string $icono = null,
        public ?array $empresa_ids = null
    ) {}

    public static function fromRequest(array $data): self
    {
        return new self(
            $data['nombre'] ?? null,
            isset($data['cashback_porcentaje']) ? (float) $data['cashback_porcentaje'] : null,
            isset($data['vigencia_dias']) ? (int) $data['vigencia_dias'] : null,
            isset($data['consumo_minimo']) ? (float) $data['consumo_minimo'] : null,
            $data['color'] ?? null,
            $data['icono'] ?? null,
            $data['empresa_ids'] ?? null
        );
    }

    public function toArray(): array
    {
        $data = [
            'nombre'              => $this->nombre,
            'cashback_porcentaje' => $this->cashback_porcentaje,
            'vigencia_dias'       => $this->vigencia_dias,
            'consumo_minimo'      => $this->consumo_minimo,
            'color'               => $this->color,
            'icono'               => $this->icono,
        ];

        // IMPORTANTE: Solo filtramos lo que es estrictamente NULL.
        // Si el valor es 0 (como en consumo_minimo), se mantendrá en el array.
        return array_filter($data, fn($value) => !is_null($value));
    }
}