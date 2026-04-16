<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
   public function up(): void
    {
        Schema::create('mensaje_whatsapps', function (Blueprint $table) {
            $table->id();
            $table->string('from_phone');    // Para guardar el número del cliente
            $table->text('message_body');    // Para guardar el texto del mensaje
            $table->string('message_sid');   // Para guardar el ID único de Twilio
            $table->enum('direction', ['inbound', 'outbound']); // Para saber quién escribió
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mensaje_whatsapps');
    }
};
