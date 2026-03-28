<?php

namespace App\DTOs\Sede;

class CrearSedeDTO
{
    public function __construct(
        public int $empresa_id,
        public string $nombre_sede,
        public ?string $direccion_sede
    ) {}

    public static function fromRequest($request): self
    {
        return new self(
            $request->validated()['empresa_id'],
            $request->validated()['nombre_sede'],
            $request->validated()['direccion_sede'] ?? null
        );
    }
}