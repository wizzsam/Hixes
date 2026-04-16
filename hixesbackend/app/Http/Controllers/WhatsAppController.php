<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Twilio\Rest\Client;
use Twilio\Http\CurlClient;
use App\Models\MensajeWhatsapp;
use App\Models\Cliente;
use App\Models\Oportunidad;
use App\Models\OportunidadHistorial;
use App\Models\CrmAsignacionChat;
use App\Models\Usuarios;
use Illuminate\Support\Facades\Log;


class WhatsAppController extends Controller
{
  
    private function normalizePhone(string $raw): string
    {
        // Si ya viene formateado de Twilio lo dejamos igual
        if (str_starts_with($raw, 'whatsapp:')) {
            return $raw;
        }
        return 'whatsapp:' . ltrim($raw, '+');
    }

    private function phoneDigits(string $raw): string
    {
        return preg_replace('/\D/', '', $raw);
    }


    public function receiveMessage(Request $request)
    {
        try {
            $mediaUrl  = null;
            $mediaType = null;

            // ── Archivos adjuntos (imagen, audio, video, documento) ──────────
            $numMedia = (int) $request->input('NumMedia', 0);
            if ($numMedia > 0) {
                $twilioMediaUrl = $request->input('MediaUrl0');
                $mimeType       = $request->input('MediaContentType0', 'application/octet-stream');

                // Descargamos el archivo de Twilio y lo guardamos localmente
                // para evitar dependencia de URLs de Twilio que pueden expirar.
                $sid   = env('TWILIO_SID');
                $token = env('TWILIO_AUTH_TOKEN');

                $ch = curl_init($twilioMediaUrl);
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($ch, CURLOPT_USERPWD, "{$sid}:{$token}");
                curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
                curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
                
                // ¡ESTA ES LA LÍNEA MÁGICA QUE FALTABA!
                // Twilio redirige la URL a un servidor de Amazon S3. 
                // Sin esto, cURL descarga una página en blanco de 0 KB.
                curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true); 

                $fileContents = curl_exec($ch);
                
                if(curl_errno($ch)){
                    Log::error('Error descargando archivo de Twilio: ' . curl_error($ch));
                }
                
                curl_close($ch);

                $ext      = $this->extensionFromMime($mimeType);
                $filename = uniqid('wa_') . $ext;
                $dir      = public_path('uploads/media');
                if (!is_dir($dir)) mkdir($dir, 0755, true);
                
                // Solo guardamos si realmente descargamos contenido
                if ($fileContents) {
                    file_put_contents($dir . '/' . $filename, $fileContents);
                    $mediaUrl  = url('uploads/media/' . $filename);
                    $mediaType = $mimeType;
                }
            }

            // ── Ubicación en tiempo real ──────────────────────────────────────
            if ($request->filled('Latitude') && $request->filled('Longitude')) {
                $lat       = $request->input('Latitude');
                $lon       = $request->input('Longitude');
                $mediaUrl  = "geo:{$lat},{$lon}";
                $mediaType = 'location';
            }

            $fromPhone = $request->input('From');

            // Auto-asignación al vendedor disponible con menos chats activos
            $vendedorId = CrmAsignacionController::resolverAsignacion($fromPhone);

            $mensaje = MensajeWhatsapp::create([
                'from_phone'           => $fromPhone,
                'to_phone'             => $request->input('To'),
                'message_body'         => $request->input('Body') ?? '',
                'message_sid'          => $request->input('MessageSid'),
                'direction'            => 'inbound',
                'is_read'              => false,
                'media_url'            => $mediaUrl,
                'media_type'           => $mediaType,
                'vendedor_asignado_id' => $vendedorId,
            ]);

            // Auto-crear "Nuevo Lead" en el kanban en la primera interacción del contacto.
            if ($vendedorId) {
                $esPrimerMensaje = MensajeWhatsapp::where('from_phone', $fromPhone)
                    ->where('direction', 'inbound')
                    ->count() === 1;

                if ($esPrimerMensaje) {
                    $digits  = preg_replace('/\D/', '', $fromPhone);

                    // Buscar cliente registrado por teléfono
                    $cliente = Cliente::where('telefono', 'like', "%{$digits}%")->first();

                    // Si no existe, crear un prospecto con solo el número
                    if (!$cliente) {
                        $vendedor  = Usuarios::find($vendedorId);
                        $empresaId = $vendedor?->empresa_id ?? 1;

                        $cliente = Cliente::create([
                            'empresa_id'      => $empresaId,
                            'nombre_completo' => 'Prospecto ' . $digits,
                            'telefono'        => $digits,
                            'estado'          => true,
                        ]);
                    }

                    // Solo crear si no tiene ya una oportunidad abierta
                    $yaExiste = Oportunidad::where('cliente_id', $cliente->id)
                        ->where('estado', 'abierta')
                        ->exists();

                    if (!$yaExiste) {
                        $oportunidad = Oportunidad::create([
                            'cliente_id'     => $cliente->id,
                            'vendedor_id'    => $vendedorId,
                            'titulo'         => 'Lead WhatsApp — ' . $digits,
                            'etapa'          => 'Nuevo lead',
                            'estado'         => 'abierta',
                            'valor_estimado' => 0,
                        ]);

                        OportunidadHistorial::create([
                            'oportunidad_id'  => $oportunidad->id,
                            'usuario_id'      => $vendedorId,
                            'etapa_anterior'  => null,
                            'etapa_nueva'     => 'Nuevo lead',
                            'estado_anterior' => null,
                            'estado_nuevo'    => 'abierta',
                            'accion'          => 'creacion',
                        ]);
                    }
                }
            }

            return response('OK', 200);
        } catch (\Exception $e) {
            Log::error('WhatsApp Webhook error: ' . $e->getMessage());
            return response('Error', 500);
        }
    }

    /** Devuelve la extensión de archivo según el MIME type. */
    private function extensionFromMime(string $mime): string
    {
        // Normalizar: quitar parámetros de codec como "; codecs=opus"
        $baseMime = strtolower(trim(explode(';', $mime)[0]));

        $map = [
            'image/jpeg'      => '.jpg',
            'image/png'       => '.png',
            'image/gif'       => '.gif',
            'image/webp'      => '.webp',
            'audio/ogg'       => '.ogg',
            'audio/mpeg'      => '.mp3',
            'video/mp4'       => '.mp4',
            'video/webm'      => '.webm',
            'application/pdf' => '.pdf',
        ];
        return $map[$baseMime] ?? '';
    }

    // ─── 2. RESPONDER (desde el CRM) ───────────────────────────────────────────

    public function replyMessage(Request $request)
    {
        $request->validate([
            'to'      => 'required|string',   // Ej: "whatsapp:+51916422086"
            'message' => 'required|string|max:1600',
        ]);

        $sid    = env('TWILIO_SID');
        $token  = env('TWILIO_AUTH_TOKEN');
        $from   = 'whatsapp:' . env('TWILIO_WHATSAPP_NUMBER');
        $httpClient = new CurlClient([
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_SSL_VERIFYHOST => false,
        ]);
        $twilio = new Client($sid, $token, null, null, $httpClient);

        try {
            $twilioMsg = $twilio->messages->create($request->to, [
                'from' => $from,
                'body' => $request->message,
            ]);

            $mensaje = MensajeWhatsapp::create([
                'from_phone'   => $from,
                'to_phone'     => $request->to,
                'message_body' => $request->message,
                'message_sid'  => $twilioMsg->sid,
                'direction'    => 'outbound',
                'is_read'      => true, 
            ]);

            return response()->json(['success' => true, 'mensaje' => $mensaje]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

   public function replyMedia(Request $request)
{
    $request->validate([
        'to'    => 'required|string',
        'media' => 'required|file|max:16384',
    ]);

    $file     = $request->file('media');
    $mimeType = $file->getMimeType() ?? 'application/octet-stream';

    $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
    $originalName = preg_replace('/[^a-zA-Z0-9_\-]/', '_', $originalName);
    $ext      = $this->extensionFromMime($mimeType) ?: ('.' . $file->getClientOriginalExtension());
    $filename = $originalName . '_' . uniqid() . $ext;

    $dir = public_path('uploads/media');
    if (!is_dir($dir)) mkdir($dir, 0755, true);
    $file->move($dir, $filename);

    $ngrok     = env('NGROK_URL');
    $publicUrl = $ngrok
        ? rtrim($ngrok, '/') . '/uploads/media/' . $filename
        : url('uploads/media/' . $filename);

    $sid    = env('TWILIO_SID');
    $token  = env('TWILIO_AUTH_TOKEN');
    $from   = 'whatsapp:' . env('TWILIO_WHATSAPP_NUMBER');

    $mensaje = MensajeWhatsapp::create([
        'from_phone'   => $from,
        'to_phone'     => $request->to,
        'message_body' => '',
        'message_sid'  => 'local_' . uniqid(),
        'direction'    => 'outbound',
        'is_read'      => true,
        'media_url'    => $publicUrl,
        'media_type'   => $mimeType,
    ]);

    $twilioError = null;
    try {
        $httpClient = new CurlClient([
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_SSL_VERIFYHOST => false,
        ]);
        $twilio = new Client($sid, $token, null, null, $httpClient);

        $twilioMsg = $twilio->messages->create($request->to, [
            'from'     => $from,
            'body'     => '',
            'mediaUrl' => [$publicUrl],
        ]);

        $mensaje->update(['message_sid' => $twilioMsg->sid]);
    } catch (\Exception $e) {
        Log::warning('Twilio media delivery failed: ' . $e->getMessage());
        $twilioError = $e->getMessage();
    }

    return response()->json([
        'success'      => true,
        'mensaje'      => $mensaje,
        'twilio_error' => $twilioError,  // null si fue bien, mensaje de error si falló
    ]);
}

    // ─── 3. LISTA DE CONVERSACIONES (polling endpoint) ─────────────────────────

    /**
     * Devuelve una lista de conversaciones agrupadas por número de contacto.
     * Cada conversación incluye: último mensaje, no-leídos, y datos del cliente
     * si el número está registrado.
     *
     * TODO[WS-PROD] Este endpoint desaparece en favor de un canal Reverb/Echo.
     * El frontend escucha el canal y actualiza el estado localmente.
     */
    public function getConversations()
    {
        $user = auth('api')->user();

        // Todos los mensajes ordenados para poder determinar el último
        $mensajes = MensajeWhatsapp::orderBy('created_at', 'asc')->get();

        // Agrupamos por "número de contacto" (siempre el lado externo)
        $conversaciones = [];

        // Pre-cargar asignaciones activas para evitar N+1
        $asignaciones = CrmAsignacionChat::with('vendedor')
            ->where('estado', 'activo')
            ->get()
            ->keyBy('contact_phone');

        foreach ($mensajes as $msg) {
            // El número del contacto externo es from_phone si inbound, to_phone si outbound
            $contactPhone = $msg->direction === 'inbound'
                ? $msg->from_phone
                : $msg->to_phone;

            if (!$contactPhone) continue;

            if (!isset($conversaciones[$contactPhone])) {
                $asignacion = $asignaciones->get($contactPhone);
                $conversaciones[$contactPhone] = [
                    'phone'             => $contactPhone,
                    'lastMessage'       => null,
                    'lastTime'          => null,
                    'unreadCount'       => 0,
                    'cliente'           => null,
                    'vendedor_asignado' => $asignacion ? [
                        'id'              => $asignacion->vendedor_id,
                        'nombre_completo' => $asignacion->vendedor?->nombre_completo,
                    ] : null,
                ];
            }

            // Actualizamos último mensaje
            $conversaciones[$contactPhone]['lastMessage'] = $msg->message_body;
            $conversaciones[$contactPhone]['lastTime']    = $msg->created_at;

            // Contamos no leídos (solo inbound)
            if ($msg->direction === 'inbound' && !$msg->is_read) {
                $conversaciones[$contactPhone]['unreadCount']++;
            }
        }

        // Enriquecemos con datos de Cliente si el número está registrado
        $phones = array_keys($conversaciones);
        $clientes = Cliente::where('empresa_id', $user->empresa_id)->get();

        foreach ($clientes as $cliente) {
            // Normalizamos: comparamos solo dígitos del telefono del cliente
            $digitsCliente = $this->phoneDigits($cliente->telefono);
            foreach ($phones as $phone) {
                if (str_contains($this->phoneDigits($phone), $digitsCliente) || 
                    str_contains($digitsCliente, $this->phoneDigits($phone))) {
                    $conversaciones[$phone]['cliente'] = [
                        'id'     => $cliente->id,
                        'nombre' => $cliente->nombre_completo,
                        'dni'    => $cliente->dni,
                    ];
                }
            }
        }

        // Ordenamos por último mensaje más reciente primero
        $lista = array_values($conversaciones);
        usort($lista, fn($a, $b) => strcmp((string)$b['lastTime'], (string)$a['lastTime']));

        return response()->json($lista);
    }

    // ─── 4. MENSAJES POR TELÉFONO (historial de conversación) ─────────────────

    /**
     * Devuelve todos los mensajes de una conversación específica.
     *
     * TODO[WS-PROD] En producción el historial inicial sigue siendo necesario,
     * pero los mensajes nuevos llegan por WebSocket — no por re-polling.
     */
    public function getMessagesByPhone(Request $request)
    {
        $request->validate(['phone' => 'required|string']);
        $phone = $request->query('phone');

        $digits = $this->phoneDigits($phone);

        $mensajes = MensajeWhatsapp::where(function ($q) use ($phone, $digits) {
            $q->where('from_phone', 'like', "%{$digits}%")
              ->orWhere('to_phone',   'like', "%{$digits}%");
        })->orderBy('created_at', 'asc')->get();

        return response()->json($mensajes);
    }

    // ─── 5. MARCAR CONVERSACIÓN COMO LEÍDA ─────────────────────────────────────

    public function markAsRead(string $phone)
    {
        $digits = $this->phoneDigits($phone);

        MensajeWhatsapp::where('direction', 'inbound')
            ->where('is_read', false)
            ->where('from_phone', 'like', "%{$digits}%")
            ->update(['is_read' => true]);

        return response()->json(['success' => true]);
    }

    // ─── 6. LISTAR TODOS (legacy, sigue funcionando) ───────────────────────────

    public function getMessages()
    {
        return response()->json(MensajeWhatsapp::orderBy('created_at', 'asc')->get());
    }

    // ─── 7. MENSAJE DE PRUEBA ──────────────────────────────────────────────────

    public function sendTestMessage()
    {
        // ... (Tu código de prueba que ya funciona)
    }
}