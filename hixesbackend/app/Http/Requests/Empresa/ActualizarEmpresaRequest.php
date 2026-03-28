<?php

namespace App\Http\Requests\Empresa;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ActualizarEmpresaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $empresaId = $this->route('id'); 

        return [
            'ruc' => [
                'sometimes',
                'string',
                'digits:11',
                Rule::unique('empresas', 'ruc')->ignore($empresaId),
            ],
            'razon_social'     => 'sometimes|string|max:255',
            'nombre_comercial' => 'nullable|string|max:255',
            'direccion'        => 'sometimes|string|max:500',
            'telefono'         => 'nullable|string|max:20',
            'logo'             => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120',
            'estado'           => 'sometimes|in:0,1,true,false,"0","1"',
        ];
    }

    public function messages(): array
    {
        return [
            'ruc.digits' => 'El RUC debe tener 11 dígitos.',
            'ruc.unique' => 'El RUC ingresado ya está siendo usado por otra empresa.',
        ];
    }
}