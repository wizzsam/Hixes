<?php

namespace App\DTOs\Roles;

class ActualizarRolDTO
{
    public function __construct(
        public readonly ?string $nombre_rol = null,
        public readonly ?string $descripcion = null
    ) {}

    public static function fromRequest(array $data): self
    {
        return new self(
            nombre_rol: $data['nombre_rol'] ?? null,
            descripcion: $data['descripcion'] ?? null
        );
    }

    public function toArray(): array
    {
        return array_filter([
            'nombre_rol'  => $this->nombre_rol,
            'descripcion' => $this->descripcion,
        ], fn($value) => $value !== null);
    }
}
