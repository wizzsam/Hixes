<?php

namespace App\Http\Requests\Servicio;

use Illuminate\Foundation\Http\FormRequest;

class CrearServicioRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; 
    }

    public function rules(): array
    {
        return [
            'tratamiento' => 'required|string|max:255|unique:servicios,tratamiento',
            'descripcion' => 'nullable|string|max:1000',
            'precio_base' => 'required|numeric|min:0',
            'estado'      => 'sometimes|in:0,1,true,false,"0","1"',
        ];
    }

    public function messages(): array
    {
        return [
            'tratamiento.required' => 'El nombre del tratamiento es obligatorio.',
            'tratamiento.unique'   => 'Ya existe un servicio registrado con este nombre.',
            'precio_base.required' => 'El precio base es obligatorio.',
            'precio_base.numeric'  => 'El precio debe ser un valor numérico.',
            'precio_base.min'      => 'El precio no puede ser un valor negativo.',
        ];
    }
}