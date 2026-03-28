<?php
require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

$request = Illuminate\Http\Request::create('/api/usuarios', 'POST', [
    'rol_id' => 1,
    'nombre_completo' => 'test script',
    'correo' => 'test_script@test.com',
    'password' => 'asdfasdf',
    'empresa_id' => 1
], [], [], ['HTTP_ACCEPT' => 'application/json']);

// Bypass auth for this quick test by making the user super admin
Auth::guard('api')->setUser(\App\Models\Usuarios::where('rol_id', 1)->first());

$response = $kernel->handle($request);
echo "STATUS: " . $response->getStatusCode() . "\n";
echo "CONTENT: " . $response->getContent() . "\n";

