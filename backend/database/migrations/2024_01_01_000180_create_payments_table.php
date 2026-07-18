<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->string('gateway');                 // offline | stripe | ...
            $table->string('status')->default('pending'); // pending | paid | failed | cancelled
            $table->decimal('amount', 12, 2);
            $table->string('currency', 3);
            // Gateway reference (Stripe session/intent id, etc.).
            $table->string('reference')->nullable()->index();
            $table->json('payload')->nullable();        // raw gateway payload for auditing
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
