<?php

namespace App\DTOs\Servicio;

class ActualizarServicioDTO
{
    public function __construct(
        public readonly ?string $tratamiento = null,
        public readonly ?string $descripcion = null,
        public readonly ?float $precio_base = null,
        public readonly ?bool $estado = null
    ) {}

    public static function fromRequest(array $data): self
    {
        return new self(
            tratamiento: $data['tratamiento'] ?? null,
            descripcion: $data['descripcion'] ?? null,
            precio_base: isset($data['precio_base']) ? (float)$data['precio_base'] : null,
            estado:      isset($data['estado']) ? (bool)$data['estado'] : null
        );
    }

    public function toArray(): array
    {
        // Filtramos para enviar solo los campos que vienen en el request
        return array_filter([
            'tratamiento' => $this->tratamiento,
            'descripcion' => $this->descripcion,
            'precio_base' => $this->precio_base,
            'estado'      => $this->estado,
        ], fn($value) => $value !== null);
    }
}