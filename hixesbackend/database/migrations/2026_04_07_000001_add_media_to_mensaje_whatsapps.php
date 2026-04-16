<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('mensaje_whatsapps', function (Blueprint $table) {
            if (!Schema::hasColumn('mensaje_whatsapps', 'media_url')) {
                $table->text('media_url')->nullable()->after('message_body');
            }
            if (!Schema::hasColumn('mensaje_whatsapps', 'media_type')) {
                $table->string('media_type', 100)->nullable()->after('media_url');
            }
        });
    }

    public function down(): void
    {
        Schema::table('mensaje_whatsapps', function (Blueprint $table) {
            $table->dropColumn(['media_url', 'media_type']);
        });
    }
};
