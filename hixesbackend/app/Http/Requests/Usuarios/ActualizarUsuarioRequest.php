<?php

namespace App\Http\Requests\Usuarios;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ActualizarUsuarioRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $usuarioId = $this->route('id');

        return [
            'rol_id'          => 'sometimes|integer|exists:roles,id',
            'nombre_completo' => 'sometimes|string|max:255',
            'correo'          => [
                'sometimes',
                'email',
                'max:255',
                Rule::unique('usuarios', 'correo')->ignore($usuarioId, 'id_usuario'),
            ],
            'password'        => 'nullable|string|min:6',
            'empresa_id'      => 'nullable|integer|exists:empresas,id',
            'sede_ids'        => 'nullable|array',
            'sede_ids.*'      => 'integer|exists:sedes,id',
            'estado'          => 'sometimes|boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'correo.unique' => 'El correo ingresado ya está siendo usado por otro usuario.',
            'correo.email' => 'El correo debe ser válido.',
            'rol_id.exists' => 'El rol seleccionado no es válido.',
            'empresa_id.exists' => 'La empresa seleccionada no es válida.',
        ];
    }
}