<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('currencies', function (Blueprint $table) {
            $table->id();
            $table->string('code', 3)->unique();       // USD, EUR, EGP
            $table->string('name');                     // US Dollar
            $table->string('symbol', 8);                // $
            $table->string('symbol_position')->default('before'); // before|after
            // Exchange rate relative to the platform base currency (1.0 = base).
            $table->decimal('exchange_rate', 16, 6)->default(1);
            $table->unsignedTinyInteger('decimal_places')->default(2);
            $table->boolean('is_active')->default(true);
            $table->boolean('is_default')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('currencies');
    }
};
