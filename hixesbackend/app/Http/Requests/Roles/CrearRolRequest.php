<?php

namespace App\Http\Requests\Roles;

use Illuminate\Foundation\Http\FormRequest;

class CrearRolRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nombre_rol'  => 'required|string|max:255|unique:roles,nombre_rol',
            'descripcion' => 'nullable|string|max:500',
        ];
    }

    public function messages(): array
    {
        return [
            'nombre_rol.required' => 'El nombre del rol es obligatorio.',
            'nombre_rol.unique'   => 'Este rol ya existe en el sistema.',
        ];
    }
}
