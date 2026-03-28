<?php

namespace App\Services;

use App\DTOs\Usuarios\ActualizarUsuarioDTO;
use App\DTOs\Usuarios\CrearUsuarioDTO;
use App\Repositories\UsuarioRepository;
use App\Models\Usuarios;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Hash;

class UsuarioService
{
    public function __construct(
        private readonly UsuarioRepository $usuarioRepository
    ) {}

    public function crearUsuario(CrearUsuarioDTO $dto): Usuarios
    {
        $datosParaCrear = $dto->toArray();
        $datosParaCrear['password'] = Hash::make($datosParaCrear['password']);
        
        return $this->usuarioRepository->crear($datosParaCrear);
    }

    public function listarUsuarios(): Collection
    {
        return $this->usuarioRepository->obtenerTodos();
    }

    public function listarAdministradores(): Collection
    {
        return $this->usuarioRepository->obtenerTodos()->filter(function ($usuario) {
            return in_array($usuario->rol_id, [1, 2]); // Ejemplo: 1=Super Admin, 2=Admin Empresa
        })->values();
    }

    public function obtenerUsuarioPorId(int $id): ?Usuarios
    {
        return $this->usuarioRepository->buscarPorId($id);
    }

    public function actualizarUsuario(int $id, ActualizarUsuarioDTO $dto): ?Usuarios
    {
        $usuario = $this->usuarioRepository->buscarPorId($id);
        
        if (!$usuario) {
            return null;
        }

        $datosParaActualizar = $dto->toArray();
        
        if (isset($datosParaActualizar['password']) && !empty($datosParaActualizar['password'])) {
            $datosParaActualizar['password'] = Hash::make($datosParaActualizar['password']);
        } else {
            // Si no envían password o está vacío, no lo actualizamos
            unset($datosParaActualizar['password']);
        }

        return $this->usuarioRepository->actualizar($id, $datosParaActualizar);
    }

    public function cambiarEstadoUsuario(int $id): bool
    {
        $usuario = $this->usuarioRepository->buscarPorId($id);
        
        if (!$usuario) {
            return false;
        }
        
        // Regla de negocio simple: evitar que el único super admin se desactive a sí mismo podría ir aquí.
        // Pero lo mantendremos simple.
        $nuevoEstado = !$usuario->estado;
        
        return $this->usuarioRepository->actualizar($id, ['estado' => $nuevoEstado]) ? true : false;
    }
}