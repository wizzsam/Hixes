<?php

namespace App\Http\Requests\Sede;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ActualizarSedeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $sedeId = $this->route('id');

        return [
            'empresa_id'    => 'sometimes|exists:empresas,id',
            'nombre_sede'   => [
                'sometimes',
                'string',
                'max:100',
                Rule::unique('sedes')
                    ->where(function ($query) {
                        return $query->where('empresa_id', $this->input('empresa_id'));
                    })
                    ->ignore($sedeId),  // ignora la sede actual al editar
            ],
            'direccion_sede' => 'nullable|string|max:500',
            'estado'         => 'sometimes|boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'nombre_sede.unique' => 'Ya existe una sede con ese nombre en esta empresa. Prueba con un nombre diferente.',
        ];
    }
}
