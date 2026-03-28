<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class Cors
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next)
    {
        $origin = $request->header('Origin');
        $allowedOrigins = [
            'https://erp.hexiswellnesscenter.com',
            'http://erp.hexiswellnesscenter.com',
            'http://localhost:5173',
            'http://localhost:3000',
        ];

        $responseOrigin = in_array($origin, $allowedOrigins) ? $origin : 'https://erp.hexiswellnesscenter.com';

        // Manejar solicitudes OPTIONS (preflight)
        if ($request->getMethod() == "OPTIONS") {
            return response('', 200)
                ->header('Access-Control-Allow-Origin', $responseOrigin)
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, X-CSRF-TOKEN, X-Sede-Id')
                ->header('Access-Control-Allow-Credentials', 'true')
                ->header('Access-Control-Max-Age', '1728000');
        }

        $response = $next($request);

        // Aplicar headers CORS a la respuesta
        return $response
            ->header('Access-Control-Allow-Origin', $responseOrigin)
            ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
            ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, X-CSRF-TOKEN, X-Sede-Id')
            ->header('Access-Control-Allow-Credentials', 'true');
    }
}
