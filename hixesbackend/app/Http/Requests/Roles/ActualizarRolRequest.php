<?php

namespace App\Http\Requests\Roles;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ActualizarRolRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $rolId = $this->route('id');

        return [
            'nombre_rol' => [
                'sometimes',
                'string',
                'max:255',
                Rule::unique('roles', 'nombre_rol')->ignore($rolId),
            ],
            'descripcion' => 'nullable|string|max:500',
        ];
    }

    public function messages(): array
    {
        return [
            'nombre_rol.unique' => 'Ya existe un rol con este nombre.',
        ];
    }
}
