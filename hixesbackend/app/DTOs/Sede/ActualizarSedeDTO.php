<?php

namespace App\DTOs\Sede;

class ActualizarSedeDTO
{
    public function __construct(
        public ?int $empresa_id = null,
        public ?string $nombre_sede = null,
        public ?string $direccion_sede = null,
        public ?bool $estado = null
    ) {}

    public static function fromRequest(array $data): self
    {
        return new self(
            $data['empresa_id'] ?? null,
            $data['nombre_sede'] ?? null,
            $data['direccion_sede'] ?? null,
            $data['estado'] ?? null
        );
    }

    public function toArray(): array
    {
        return array_filter([
            'empresa_id' => $this->empresa_id,
            'nombre_sede' => $this->nombre_sede,
            'direccion_sede' => $this->direccion_sede,
            'estado' => $this->estado
        ], fn($value) => $value !== null);
    }
}
