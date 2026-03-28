<?php

namespace App\DTOs\Usuarios;

class CrearUsuarioDTO
{
    public function __construct(
        public readonly int $rol_id,
        public readonly string $nombre_completo,
        public readonly string $correo,
        public readonly string $password,
        public readonly ?int $empresa_id = null,
        public readonly array $sede_ids = [],
        public readonly bool $estado = true
    ) {}

    public static function fromRequest(array $data): self
    {
        return new self(
            rol_id: $data['rol_id'],
            nombre_completo: $data['nombre_completo'],
            correo: $data['correo'],
            password: $data['password'],
            empresa_id: $data['empresa_id'] ?? null,
            sede_ids: $data['sede_ids'] ?? [],
            estado: $data['estado'] ?? true
        );
    }

    public function toArray(): array
    {
        return [
            'rol_id' => $this->rol_id,
            'nombre_completo' => $this->nombre_completo,
            'correo' => $this->correo,
            'password' => $this->password,
            'empresa_id' => $this->empresa_id,
            'sede_id' => count($this->sede_ids) === 1 ? $this->sede_ids[0] : null,
            'sede_ids' => $this->sede_ids,
            'estado' => $this->estado,
        ];
    }
}
