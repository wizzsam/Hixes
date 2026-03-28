<?php

namespace App\DTOs\Empresa;

class CrearEmpresaDTO
{
    public function __construct(
        public string $ruc,
        public string $razon_social,
        public ?string $nombre_comercial,
        public string $direccion,
        public ?string $telefono,
        public ?string $logo_path,
        public bool $estado = true
    ) {}

    public static function fromRequest(array $data): self
    {
        return new self(
            ruc: $data['ruc'],
            razon_social: $data['razon_social'],
            nombre_comercial: $data['nombre_comercial'] ?? null,
            direccion: $data['direccion'],
            telefono: $data['telefono'] ?? null,
            logo_path: $data['logo_path'] ?? null,
            estado: $data['estado'] ?? true
        );
    }

    public function toArray(): array
    {
        return [
            'ruc' => $this->ruc,
            'razon_social' => $this->razon_social,
            'nombre_comercial' => $this->nombre_comercial,
            'direccion' => $this->direccion,
            'telefono' => $this->telefono,
            'logo_path' => $this->logo_path,
            'estado' => $this->estado,
        ];
    }
}