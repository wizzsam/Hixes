<?php

namespace App\Http\Requests\BonoWallet;

use Illuminate\Foundation\Http\FormRequest;

class CrearBonoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'monto_minimo' => 'required|numeric|min:0',
            'monto_maximo' => 'nullable|numeric|gt:monto_minimo',
            'bono_porcentaje' => 'required|numeric|min:0|max:100',

            // Validación para la tabla intermedia
            'empresa_ids' => 'required|array|min:1',
            'empresa_ids.*' => 'exists:empresas,id',
        ];
    }

    public function messages(): array
    {
        return [
            'monto_minimo.required' => 'El monto mínimo para aplicar el bono es obligatorio.',
            'monto_maximo.gt' => 'El monto máximo debe ser mayor al monto mínimo.',
            'bono_porcentaje.required' => 'Debe indicar el porcentaje de beneficio.',
            'empresa_ids.required' => 'Debe asociar este bono al menos a una empresa.',
            'empresa_ids.*.exists' => 'Una de las empresas seleccionadas no es válida.',
        ];
    }
}