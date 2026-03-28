<?php

namespace App\DTOs\BonoWallet;

class CrearBonoDTO
{
    public function __construct(
        public float $monto_minimo,
        public ?float $monto_maximo,
        public float $bono_porcentaje,
        public array $empresa_ids
    ) {}

    public static function fromRequest(array $data): self
    {
        return new self(
            (float) $data['monto_minimo'],
            isset($data['monto_maximo']) ? (float) $data['monto_maximo'] : null,
            (float) $data['bono_porcentaje'],
            $data['empresa_ids'] ?? []
        );
    }
}