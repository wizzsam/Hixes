<?php

namespace App\DTOs\BonoWallet;

class ActualizarBonoDTO
{
    public function __construct(
        public ?float $monto_minimo = null,
        public ?float $monto_maximo = null,
        public ?float $bono_porcentaje = null,
        public ?array $empresa_ids = null
    ) {}

    public static function fromRequest(array $data): self
    {
        return new self(
            isset($data['monto_minimo']) ? (float) $data['monto_minimo'] : null,
            isset($data['monto_maximo']) ? (float) $data['monto_maximo'] : null,
            isset($data['bono_porcentaje']) ? (float) $data['bono_porcentaje'] : null,
            $data['empresa_ids'] ?? null
        );
    }

    public function toArray(): array
    {
        $data = [
            'monto_minimo'    => $this->monto_minimo,
            'monto_maximo'    => $this->monto_maximo,
            'bono_porcentaje' => $this->bono_porcentaje,
        ];

        // Solo filtramos lo que es estrictamente NULL para permitir el 0.00
        return array_filter($data, fn($value) => !is_null($value));
    }
}