<?php

namespace App\Http\Requests\Servicio;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ActualizarServicioRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $servicioId = $this->route('id'); 

        return [
            'tratamiento' => [
                'sometimes',
                'string',
                'max:255',
                Rule::unique('servicios', 'tratamiento')->ignore($servicioId),
            ],
            'descripcion' => 'nullable|string|max:1000',
            'precio_base' => 'sometimes|numeric|min:0',
            'estado'      => 'sometimes|in:0,1,true,false,"0","1"',
        ];
    }

    public function messages(): array
    {
        return [
            'tratamiento.unique'  => 'El nombre de este tratamiento ya está en uso por otro servicio.',
            'precio_base.numeric' => 'El precio debe ser un número válido.',
            'precio_base.min'     => 'El precio no puede ser negativo.',
        ];
    }
}