<?php

namespace App\DTOs\Usuarios;

class ActualizarUsuarioDTO
{
    public function __construct(
        public readonly ?array $rol_ids = null,
        public readonly ?string $nombre_completo = null,
        public readonly ?string $correo = null,
        public readonly ?string $password = null,
        public readonly ?int $empresa_id = null,
        public readonly ?array $sede_ids = null,
        public readonly ?bool $estado = null
    ) {}

    public static function fromRequest(array $data): self
    {
        return new self(
            rol_ids: $data['rol_ids'] ?? null,
            nombre_completo: $data['nombre_completo'] ?? null,
            correo: $data['correo'] ?? null,
            password: $data['password'] ?? null,
            empresa_id: array_key_exists('empresa_id', $data) ? $data['empresa_id'] : null,
            sede_ids: $data['sede_ids'] ?? null,
            estado: isset($data['estado']) ? (bool)$data['estado'] : null
        );
    }

    public function toArray(): array
    {
        $result = array_filter([
            'nombre_completo' => $this->nombre_completo,
            'correo'          => $this->correo,
            'password'        => $this->password,
            'empresa_id'      => $this->empresa_id,
            'estado'          => $this->estado,
        ], fn($value) => $value !== null);

        // Actualizar columna primaria con el primer rol seleccionado
        if ($this->rol_ids !== null && count($this->rol_ids) > 0) {
            $result['rol_id']  = $this->rol_ids[0];
            $result['rol_ids'] = $this->rol_ids;
        }

        if ($this->sede_ids !== null) {
            $result['sede_ids'] = $this->sede_ids;
            $result['sede_id']  = count($this->sede_ids) === 1 ? $this->sede_ids[0] : null;
        }

        return $result;
    }
}