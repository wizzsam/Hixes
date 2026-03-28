<?php

namespace App\Http\Requests\Empresa;

use Illuminate\Foundation\Http\FormRequest;

class CrearEmpresaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; 
    }

    public function rules(): array
    {
        return [
            'ruc'              => 'required|string|digits:11|unique:empresas,ruc',
            'razon_social'     => 'required|string|max:255',
            'nombre_comercial' => 'nullable|string|max:255',
            'direccion'        => 'required|string|max:500',
            'telefono'         => 'nullable|string|max:20',
            'logo'             => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120',
            'estado'           => 'sometimes|in:0,1,true,false,"0","1"',
        ];
    }

    public function messages(): array
    {
        return [
            'ruc.required' => 'El RUC es obligatorio para registrar la empresa.',
            'ruc.digits'   => 'El RUC debe tener exactamente 11 dígitos.',
            'ruc.unique'   => 'Este RUC ya pertenece a otra empresa registrada.',
            'razon_social.required' => 'La razón social (nombre legal) es obligatoria.',
            'direccion.required' => 'La dirección fiscal es obligatoria.',
        ];
    }
}