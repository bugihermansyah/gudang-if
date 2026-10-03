<?php

use App\Enums\BatchStatus;
use App\Enums\ValetStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('sku', 64)->unique();
            $table->string('name');
            $table->unsignedInteger('max_cartons_per_valet');
            $table->string('carton_size_note')->nullable();
            $table->boolean('active')->default(true)->index();
            $table->timestamps();
        });

        Schema::create('companies', function (Blueprint $table) {
            $table->id();
            $table->string('code', 64)->unique();
            $table->string('name');
            $table->boolean('active')->default(true)->index();
            $table->timestamps();
        });

        Schema::create('rows', function (Blueprint $table) {
            $table->id();
            $table->string('code', 64)->unique();
            $table->string('name');
            $table->boolean('active')->default(true)->index();
            $table->timestamps();
        });

        Schema::create('valets', function (Blueprint $table) {
            $table->id();
            $table->string('code', 64)->unique();
            $table->foreignId('row_id')->constrained('rows')->restrictOnDelete();
            $table->string('status', 32)->default(ValetStatus::Active->value)->index();
            $table->string('label_color', 32)->nullable();
            $table->timestamps();
        });

        Schema::create('batches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->restrictOnDelete();
            $table->string('batch_no', 96);
            $table->date('expires_on');
            $table->string('status', 32)->default(BatchStatus::Active->value)->index();
            $table->timestamps();

            $table->unique(['product_id', 'batch_no']);
            $table->index(['expires_on', 'status']);
        });

        Schema::create('valet_stocks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('valet_id')->constrained()->restrictOnDelete();
            $table->foreignId('product_id')->constrained()->restrictOnDelete();
            $table->foreignId('batch_id')->constrained()->restrictOnDelete();
            $table->unsignedInteger('qty_on_hand')->default(0);
            $table->unsignedInteger('qty_reserved')->default(0);
            $table->unsignedInteger('qty_held')->default(0);
            $table->timestamps();

            $table->unique(['valet_id', 'product_id', 'batch_id']);
            $table->index(['product_id', 'batch_id']);
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE products ADD CONSTRAINT products_max_cartons_positive CHECK (max_cartons_per_valet > 0)');
            DB::statement('ALTER TABLE valet_stocks ADD CONSTRAINT valet_stocks_reserved_held_within_stock CHECK (qty_reserved + qty_held <= qty_on_hand)');
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('valet_stocks');
        Schema::dropIfExists('batches');
        Schema::dropIfExists('valets');
        Schema::dropIfExists('rows');
        Schema::dropIfExists('companies');
        Schema::dropIfExists('products');
    }
};
