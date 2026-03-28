<?php

namespace App\Http\Requests\Sede;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CrearSedeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'empresa_id'    => 'required|exists:empresas,id',
            'nombre_sede'   => [
                'required',
                'string',
                'max:100',
                Rule::unique('sedes')->where(function ($query) {
                    return $query->where('empresa_id', $this->input('empresa_id'));
                }),
            ],
            'direccion_sede' => 'nullable|string|max:500',
        ];
    }

    public function messages(): array
    {
        return [
            'empresa_id.required'  => 'Debe asociar la sede a una empresa válida.',
            'empresa_id.exists'    => 'La empresa seleccionada no existe en la base de datos.',
            'nombre_sede.required' => 'El nombre de la sede es obligatorio.',
            'nombre_sede.unique'   => 'Ya existe una sede con ese nombre en esta empresa. Prueba con un nombre diferente.',
        ];
    }
}
