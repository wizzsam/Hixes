<?php

namespace App\Http\Requests\Nivel;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ActualizarNivelRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $nivelId = $this->route('id');

        return [
            'nombre' => [
                'sometimes',
                'string',
                'max:50',
                Rule::unique('niveles', 'nombre')->ignore($nivelId),
            ],
            'cashback_porcentaje' => 'sometimes|numeric|min:0|max:100',
            'vigencia_dias' => 'sometimes|integer|min:1',
            'consumo_minimo' => 'sometimes|numeric|min:0',
            'color' => 'nullable|string|max:50',
            'icono' => 'nullable|string|max:50',
            
            'empresa_ids' => 'sometimes|array',
            'empresa_ids.*' => 'exists:empresas,id',
        ];
    }

    public function messages(): array
    {
        return [
            'nombre.unique' => 'Este nombre de nivel ya está en uso por otro registro.',
            'empresa_ids.*.exists' => 'Una de las empresas seleccionadas no existe.',
        ];
    }
}