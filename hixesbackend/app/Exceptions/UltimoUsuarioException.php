<?php

namespace App\Exceptions;

use Exception;

class UltimoUsuarioException extends Exception
{
    public function __construct(string $message = "No se puede desactivar el último usuario del sistema", int $code = 400, Exception $previous = null)
    {
        parent::__construct($message, $code, $previous);
    }
}