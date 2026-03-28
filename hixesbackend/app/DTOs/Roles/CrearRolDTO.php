<?php

namespace App\DTOs\Roles;

class CrearRolDTO
{
    public function __construct(
        public readonly string $nombre_rol,
        public readonly ?string $descripcion = null
    ) {}

    public static function fromRequest(array $data): self
    {
        return new self(
            nombre_rol: $data['nombre_rol'],
            descripcion: $data['descripcion'] ?? null
        );
    }

    public function toArray(): array
    {
        return [
            'nombre_rol'  => $this->nombre_rol,
            'descripcion' => $this->descripcion,
        ];
    }
}
