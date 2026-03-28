<?php

namespace App\Http\Requests\BonoWallet;

use Illuminate\Foundation\Http\FormRequest;

class ActualizarBonoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'monto_minimo' => 'sometimes|numeric|min:0',
            'monto_maximo' => 'nullable|numeric', // Validamos lógica en el DTO o Service si es necesario
            'bono_porcentaje' => 'sometimes|numeric|min:0|max:100',

            'empresa_ids' => 'sometimes|array',
            'empresa_ids.*' => 'exists:empresas,id',
        ];
    }

    public function messages(): array
    {
        return [
            'monto_minimo.numeric' => 'El monto mínimo debe ser un valor numérico.',
            'empresa_ids.*.exists' => 'Una de las empresas seleccionadas no existe en el sistema.',
        ];
    }
}