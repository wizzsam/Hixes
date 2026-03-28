
<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UsuarioController;
use App\Http\Controllers\EmpresaController;
use App\Http\Controllers\RolController;
use App\Http\Controllers\ClienteController;
use App\Http\Controllers\NivelController;
use App\Http\Controllers\BonoWalletController;
use App\Http\Controllers\ServicioController;

// 1. Manejar solicitudes OPTIONS para CORS (Se queda al inicio)
Route::options('{any}', function () {
    return response('', 200)
        ->header('Access-Control-Allow-Origin', 'http://localhost:3000, http://localhost:5173')
        ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
        ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, X-CSRF-TOKEN')
        ->header('Access-Control-Allow-Credentials', 'true')
        ->header('Access-Control-Max-Age', '1728000');
})->where('any', '.*');

// 2. Rutas de autenticación (Públicas)
Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
});

// 3. Rutas públicas (sin JWT) para el formulario de registro de clientes
Route::get('/sedes/publicas', [\App\Http\Controllers\SedeController::class, 'obtenerPublicas']);
Route::post('/clientes/registro-publico', [ClienteController::class, 'registroPublico']);

// 3. Rutas protegidas con JWT
Route::middleware(['force.json', \App\Http\Middleware\JWTAuthMiddleware::class])->group(function () {
    
    // Cerrar sesión
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // Datos del usuario logueado
    Route::get('/me', [AuthController::class, 'me']);

    // Sistemas/sedes asignados al usuario (para el portal del trabajador)
    Route::get('/auth/mis-sistemas', [AuthController::class, 'misSistemas']);

    
    // --- GESTIÓN DE EMPRESAS (Solo SUPER_ADMIN) ---
    // Aquí es donde lo agregas. Usamos el middleware de rol que discutimos.
    Route::prefix('empresas')->middleware('role:SUPER_ADMIN')->group(function () {
        Route::get('/', [EmpresaController::class, 'listarEmpresas']);
        Route::post('/', [EmpresaController::class, 'crearEmpresa']);
        Route::get('/{id}', [EmpresaController::class, 'obtenerEmpresaPorId']);
        Route::patch('/{id}', [EmpresaController::class, 'actualizarEmpresa']);
        Route::put('/{id}/estado', [EmpresaController::class, 'cambiarEstadoEmpresa']);
    });

    // --- GESTIÓN DE ROLES ---
    Route::prefix('roles')->middleware('role:SUPER_ADMIN')->group(function () {
        Route::get('/', [RolController::class, 'listarRoles']);
        Route::post('/', [RolController::class, 'crearRol']);
        Route::get('/{id}', [RolController::class, 'obtenerRolPorId']);
        Route::patch('/{id}', [RolController::class, 'actualizarRol']);
        Route::delete('/{id}', [RolController::class, 'eliminarRol']);
    });

    // --- GESTIÓN DE SEDES ---
    Route::prefix('sedes')->middleware('role:SUPER_ADMIN')->group(function () {
        Route::get('/', [\App\Http\Controllers\SedeController::class, 'obtenerTodas']);
        Route::post('/', [\App\Http\Controllers\SedeController::class, 'registrarSede']);
        Route::get('/{id}', [\App\Http\Controllers\SedeController::class, 'obtenerSedePorId']);
        Route::patch('/{id}', [\App\Http\Controllers\SedeController::class, 'actualizarSede']);
        Route::put('/{id}/estado', [\App\Http\Controllers\SedeController::class, 'cambiarEstadoSede']);
        Route::delete('/{id}', [\App\Http\Controllers\SedeController::class, 'eliminarSede']);
    });

    // --- GESTIÓN DE USUARIOS ---
    Route::prefix('usuarios')->group(function () {
        Route::post('/', [UsuarioController::class, 'crearUsuario']);
        Route::get('/', [UsuarioController::class, 'listarUsuarios']);
        Route::get('/administradores', [UsuarioController::class, 'listarAdministradores']);
        Route::get('/{id}', [UsuarioController::class, 'obtenerUsuarioPorId']);
        Route::patch('/{id}', [UsuarioController::class, 'actualizarUsuario']);
        Route::put('/{id}/estado', [UsuarioController::class, 'cambiarEstadoUsuario']);
    });

    // --- GESTIÓN DE CLIENTES (FIDELIZACIÓN) ---
    Route::prefix('clientes')->group(function () {
        Route::get('/', [ClienteController::class, 'index']);
        Route::post('/', [ClienteController::class, 'store']);
        Route::get('/{id}', [ClienteController::class, 'show']);
        Route::put('/{id}', [ClienteController::class, 'update']);
        Route::patch('/{id}/estado', [ClienteController::class, 'toggleEstado']);
        Route::post('/{id}/consumo', [ClienteController::class, 'registrarConsumo']);
        Route::post('/{id}/wallet', [ClienteController::class, 'recargarWallet']);
        Route::post('/{id}/pagar', [ClienteController::class, 'pagarConSaldo']);
    });

    // --- NIVELES DE FIDELIZACIÓN ---
    Route::prefix('niveles')->group(function () {
        Route::get('/', [NivelController::class, 'obtenerTodos']);           
        Route::post('/', [NivelController::class, 'registrarNivel']);        
        Route::get('/{id}', [NivelController::class, 'obtenerNivelPorId']);   
        Route::put('/{id}', [NivelController::class, 'actualizarNivel']);     
        Route::patch('/{id}/estado', [NivelController::class, 'cambiarEstadoNivel']); 
        Route::delete('/{id}', [NivelController::class, 'eliminarNivel']);    
    });

    // --- BONOS DE WALLET (Billetera) ---
    Route::prefix('bonos')->group(function () {
        Route::get('/', [BonoWalletController::class, 'obtenerTodos']);
        Route::post('/', [BonoWalletController::class, 'registrarBono']);
        Route::get('/{id}', [BonoWalletController::class, 'obtenerBonoPorId']);
        Route::put('/{id}', [BonoWalletController::class, 'actualizarBono']);
        Route::patch('/{id}/estado', [BonoWalletController::class, 'cambiarEstadoBono']);
        Route::delete('/{id}', [BonoWalletController::class, 'eliminarBono']);
    });

    Route::prefix('servicios')->group(function () {
        Route::get('/', [ServicioController::class, 'obtenerTodos']);
        Route::post('/', [ServicioController::class, 'registrarServicio']);
        Route::get('/{id}', [ServicioController::class, 'obtenerServicioPorId']);
        Route::put('/{id}', [ServicioController::class, 'actualizarServicio']);
        Route::patch('/{id}/estado', [ServicioController::class, 'cambiarEstadoServicio']);
        Route::delete('/{id}', [ServicioController::class, 'eliminarServicio']);
    });

});
