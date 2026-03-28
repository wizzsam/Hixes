<?php

namespace App\DTOs\Servicio;

class CrearServicioDTO
{
    public function __construct(
        public string $tratamiento,
        public ?string $descripcion,
        public float $precio_base,
        public bool $estado = true
    ) {}

    public static function fromRequest(array $data): self
    {
        return new self(
            tratamiento: $data['tratamiento'],
            descripcion: $data['descripcion'] ?? null,
            precio_base: (float) $data['precio_base'],
            estado: $data['estado'] ?? true
        );
    }

    public function toArray(): array
    {
        return [
            'tratamiento' => $this->tratamiento,
            'descripcion' => $this->descripcion,
            'precio_base' => $this->precio_base,
            'estado'      => $this->estado,
        ];
    }
}