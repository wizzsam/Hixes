<?php

namespace App\Http\Requests\Usuarios;

use Illuminate\Foundation\Http\FormRequest;

class CrearUsuarioRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'rol_id'          => 'required|integer|exists:roles,id',
            'nombre_completo' => 'required|string|max:255',
            'correo'          => 'required|email|max:255|unique:usuarios,correo',
            'password'        => 'required|string|min:6',
            'empresa_id'      => 'nullable|integer|exists:empresas,id',
            'sede_ids'        => 'nullable|array',
            'sede_ids.*'      => 'integer|exists:sedes,id',
            'estado'          => 'sometimes|boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'correo.required' => 'El correo es obligatorio.',
            'correo.email' => 'El correo debe ser válido.',
            'correo.unique' => 'Este correo ya está registrado en el sistema.',
            'rol_id.required' => 'El rol es obligatorio.',
            'rol_id.exists' => 'El rol seleccionado no es válido.',
            'empresa_id.exists' => 'La empresa seleccionada no es válida.',
        ];
    }
}