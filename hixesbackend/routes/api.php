
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
use App\Http\Controllers\WhatsAppController;
use App\Http\Controllers\OportunidadController;
use App\Http\Controllers\TareaController;
use App\Http\Controllers\CrmEtiquetaController;
use App\Http\Controllers\PipelineEtapaController;
use App\Http\Controllers\ReporteController;
use App\Http\Controllers\CrmAsignacionController;
use App\Http\Controllers\VendedorSesionController;
use App\Http\Controllers\RecordatorioCashbackController;
use App\Http\Controllers\CampanaController;

// 1. Manejar solicitudes OPTIONS para CORS (Se queda al inicio)
Route::options('{any}', function () {
    return response('', 200)
        ->header('Access-Control-Allow-Origin', 'http://localhost:3000, http://localhost:5173, https://erp.hexiswellnesscenter.com, http://erp.hexiswellnesscenter.com')
        ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
        ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, X-CSRF-TOKEN')
        ->header('Access-Control-Allow-Credentials', 'true')
        ->header('Access-Control-Max-Age', '1728000');
})->where('any', '.*');

// 2. Rutas de autenticación (Públicas)
Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
});

Route::get('/test-whatsapp', [WhatsAppController::class, 'sendTestMessage']);
Route::post('/whatsapp/webhook', [WhatsAppController::class, 'receiveMessage']);

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
        Route::patch('/{id}/beneficios', [ClienteController::class, 'habilitarBeneficios']);
        Route::patch('/{id}/beneficios/deshabilitar', [ClienteController::class, 'deshabilitarBeneficios']);
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

    // ─── OPORTUNIDADES (KANBAN CRM) ────────────────────────────────────────────
    Route::prefix('oportunidades')->group(function () {
        Route::get('/',                      [OportunidadController::class, 'index']);
        Route::post('/',                     [OportunidadController::class, 'store']);
        Route::patch('/{id}/etapa',          [OportunidadController::class, 'updateEtapa']);
        Route::post('/{id}/etapa-archivos',  [OportunidadController::class, 'updateEtapaConArchivos']);
        Route::patch('/{id}/estado',         [OportunidadController::class, 'updateEstado']);
        Route::get('/{id}/historial',        [OportunidadController::class, 'historial']);
    });

    // ─── REPORTES ──────────────────────────────────────────────────────────────
    Route::prefix('reportes')->group(function () {
        Route::get('/oportunidades', [ReporteController::class, 'oportunidades']);
    });

    Route::patch('/clientes/{id}/contacto', [OportunidadController::class, 'updateClienteContacto']);

    // ─── TAREAS (CRM) ─────────────────────────────────────────────────────────
    Route::prefix('tareas')->group(function () {
        Route::get('/',              [TareaController::class, 'index']);
        Route::post('/',             [TareaController::class, 'store']);
        Route::patch('/{id}/estado', [TareaController::class, 'updateEstado']);
        Route::delete('/{id}',       [TareaController::class, 'destroy']);
    });

    // ─── WHATSAPP CRM ──────────────────────────────────────────────────────────
    // TODO[WS-PROD] Cuando migres a Laravel Reverb:
    //   - Elimina GET /whatsapp/conversations y GET /whatsapp/messages (ya no se pollea)
    //   - El frontend escuchará el canal "whatsapp" con Laravel Echo
    //   - Conserva POST /reply y POST /mark-read/{phone}
    Route::prefix('whatsapp')->group(function () {
        Route::get('/conversations',        [WhatsAppController::class, 'getConversations']);
        Route::get('/messages',             [WhatsAppController::class, 'getMessagesByPhone']);
        Route::post('/reply',               [WhatsAppController::class, 'replyMessage']);
        Route::post('/reply-media',         [WhatsAppController::class, 'replyMedia']);
        Route::post('/mark-read/{phone}',   [WhatsAppController::class, 'markAsRead'])
            ->where('phone', '.*');
    });

    // ─── PIPELINE ETAPAS (KANBAN) ──────────────────────────────────────────────
    Route::prefix('pipeline-etapas')->group(function () {
        Route::get('/',                 [PipelineEtapaController::class, 'index']);
        Route::post('/',                [PipelineEtapaController::class, 'store']);
        Route::patch('/{id}',           [PipelineEtapaController::class, 'update']);
        Route::patch('/{id}/activo',    [PipelineEtapaController::class, 'toggleActivo']);
        Route::post('/reordenar',       [PipelineEtapaController::class, 'reordenar']);
        Route::delete('/{id}',          [PipelineEtapaController::class, 'destroy']);
    });

    // ─── CRM ETIQUETAS ─────────────────────────────────────────────────────────
    Route::prefix('crm')->group(function () {        Route::get('/etiquetas',                          [CrmEtiquetaController::class, 'index']);
        Route::post('/etiquetas',                         [CrmEtiquetaController::class, 'store']);
        Route::put('/etiquetas/{id}',                     [CrmEtiquetaController::class, 'update']);
        Route::delete('/etiquetas/{id}',                  [CrmEtiquetaController::class, 'destroy']);

        Route::get('/conversacion-etiquetas',             [CrmEtiquetaController::class, 'asignaciones']);
        Route::post('/conversacion-etiquetas',            [CrmEtiquetaController::class, 'asignar']);
        Route::delete('/conversacion-etiquetas/{id}',     [CrmEtiquetaController::class, 'desasignar']);

        // ─── Asignaciones de chat ───────────────────────────────────────────
        Route::get('/asignaciones',                       [CrmAsignacionController::class, 'index']);
        Route::get('/mi-asignacion',                      [CrmAsignacionController::class, 'miAsignacion']);
        Route::delete('/asignaciones/{phone}',            [CrmAsignacionController::class, 'liberar'])
            ->where('phone', '.*');
        Route::post('/asignaciones/liberar-por-oportunidad', [CrmAsignacionController::class, 'liberarPorOportunidad']);
        Route::post('/asignaciones/transferir',              [CrmAsignacionController::class, 'transferir']);
    });

    // ─── VENDEDOR SESIÓN ────────────────────────────────────────────────────────
    Route::prefix('vendedor')->group(function () {
        Route::get('/sesion',  [VendedorSesionController::class, 'estado']);
        Route::post('/sesion', [VendedorSesionController::class, 'toggle']);
    });

    // ─── VENDEDORES DISPONIBLES ────────────────────────────────────────────────
    Route::get('/vendedores/disponibles', [CrmAsignacionController::class, 'vendedoresDisponibles']);

    // ─── RECORDATORIOS DE CASHBACK ─────────────────────────────────────────────
    Route::prefix('recordatorios-cashback')->group(function () {
        Route::get('/',              [RecordatorioCashbackController::class, 'index']);
        Route::post('/',             [RecordatorioCashbackController::class, 'store']);
        Route::put('/{id}',          [RecordatorioCashbackController::class, 'update']);
        Route::patch('/{id}/activo', [RecordatorioCashbackController::class, 'toggleActivo']);
        Route::delete('/{id}',       [RecordatorioCashbackController::class, 'destroy']);
    });

    // ─── CAMPAÑAS ──────────────────────────────────────────────────────────────
    Route::prefix('campanas')->group(function () {
        // CRUD campañas
        Route::get('/',        [CampanaController::class, 'index']);
        Route::post('/',       [CampanaController::class, 'store']);
        Route::get('/{id}',    [CampanaController::class, 'show']);
        Route::put('/{id}',    [CampanaController::class, 'update']);
        Route::delete('/{id}', [CampanaController::class, 'destroy']);

        // Etapas de una campaña
        Route::get('/{campanaId}/etapas',                 [CampanaController::class, 'etapas']);
        Route::post('/{campanaId}/etapas',                [CampanaController::class, 'storeEtapa']);
        Route::put('/{campanaId}/etapas/{etapaId}',       [CampanaController::class, 'updateEtapa']);
        Route::delete('/{campanaId}/etapas/{etapaId}',    [CampanaController::class, 'destroyEtapa']);

        // Clientes en la campaña (kanban)
        Route::get('/{id}/clientes',                              [CampanaController::class, 'clientes']);
        Route::post('/{id}/clientes',                             [CampanaController::class, 'agregarCliente']);
        Route::delete('/{id}/clientes/{clienteId}',               [CampanaController::class, 'removerCliente']);
        Route::patch('/{id}/clientes/{clienteId}/etapa',          [CampanaController::class, 'moverEtapa']);
    });

});
