<?php

namespace App\Utils;

enum RolesEnum:int
{
    case ADMINISTRADOR = 1;

    public function getName(): string
    {
        return match($this){
            self::ADMINISTRADOR => 'SUPER_ADMIN',
        };
    }

    public function getDescription(): string
    {
        return match($this){
            self::ADMINISTRADOR => 'Usuario con permisos completos en el sistema',
        };
    }

    public static function fromId(int $id): ?self
    {
        return match($id){
            1 => self::ADMINISTRADOR,
            default => null,
        };
    }

    public static function getAll():array
    {
        return [
            self::ADMINISTRADOR->value => self::ADMINISTRADOR->getName(),
        ];
    }

    public function isAdmin():bool
    {
        return $this === self::ADMINISTRADOR;
    }

}