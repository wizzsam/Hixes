<?php

namespace App\Http\Requests\Nivel;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CrearNivelRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nombre' => 'required|string|max:50|unique:niveles,nombre',
            'cashback_porcentaje' => 'required|numeric|min:0|max:100',
            'vigencia_dias' => 'required|integer|min:1',
            'consumo_minimo' => 'required|numeric|min:0',
            'color' => 'nullable|string|max:50',
            'icono' => 'nullable|string|max:50',
            
            // Validación para la tabla intermedia
            'empresa_ids' => 'required|array|min:1',
            'empresa_ids.*' => 'exists:empresas,id',
        ];
    }

    public function messages(): array
    {
        return [
            'nombre.required' => 'El nombre del nivel (ej. ORIGEN) es obligatorio.',
            'nombre.unique' => 'Ya existe un nivel con este nombre.',
            'cashback_porcentaje.required' => 'Debe indicar el porcentaje de cashback.',
            'vigencia_dias.required' => 'Indique cuántos días será válido el saldo.',
            'consumo_minimo.required' => 'El consumo mínimo es necesario para clasificar al cliente.',
            'empresa_ids.required' => 'Debe asociar este nivel al menos a una empresa.',
            'empresa_ids.array' => 'El formato de las empresas seleccionadas no es válido.',
            'empresa_ids.*.exists' => 'Una de las empresas seleccionadas no es válida.',
        ];
    }
}