<?php

namespace App\DTOs\Empresa;

class ActualizarEmpresaDTO
{
    public function __construct(
        public readonly ?string $ruc = null,
        public readonly ?string $razon_social = null,
        public readonly ?string $nombre_comercial = null,
        public readonly ?string $direccion = null,
        public readonly ?string $telefono = null,
        public readonly ?string $logo_path = null,
        public readonly ?bool $estado = null
    ){}

    public static function fromRequest(array $data): self
    {
        return new self(
            ruc: $data['ruc'] ?? null,
            razon_social: $data['razon_social'] ?? null,
            nombre_comercial: $data['nombre_comercial'] ?? null,
            direccion: $data['direccion'] ?? null,
            telefono: $data['telefono'] ?? null,
            logo_path: $data['logo_path'] ?? null,
            estado: isset($data['estado']) ? (bool)$data['estado'] : null
        );
    }

    public function toArray(): array
    {
        return array_filter([
            'ruc' => $this->ruc,
            'razon_social' => $this->razon_social,
            'nombre_comercial' => $this->nombre_comercial,
            'direccion' => $this->direccion,
            'telefono' => $this->telefono,
            'logo_path' => $this->logo_path,
            'estado' => $this->estado,
        ], fn($value) => $value !== null);
    }
}