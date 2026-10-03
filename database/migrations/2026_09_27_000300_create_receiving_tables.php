<?php

use App\Enums\ReceivingStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('receiving_documents', function (Blueprint $table) {
            $table->id();
            $table->string('internal_no', 64)->unique();
            $table->string('external_delivery_note_no', 96);
            $table->foreignId('company_id')->constrained()->restrictOnDelete();
            $table->string('vehicle_plate', 32);
            $table->string('driver_name', 160);
            $table->string('status', 32)->default(ReceivingStatus::Draft->value)->index();
            $table->timestampTz('unloading_started_at')->nullable();
            $table->timestampTz('unloading_finished_at')->nullable();
            $table->text('discrepancy_reason')->nullable();
            $table->foreignId('created_by')->constrained('users')->restrictOnDelete();
            $table->foreignId('finalized_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['external_delivery_note_no', 'company_id']);
        });

        Schema::create('receiving_lines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('receiving_document_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->restrictOnDelete();
            $table->foreignId('batch_id')->constrained()->restrictOnDelete();
            $table->unsignedInteger('qty_delivery_note');
            $table->unsignedInteger('qty_physical');
            $table->text('discrepancy_reason')->nullable();
            $table->timestamps();

            $table->index(['receiving_document_id', 'product_id']);
        });

        Schema::create('receiving_allocations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('receiving_line_id')->constrained()->cascadeOnDelete();
            $table->foreignId('valet_id')->constrained()->restrictOnDelete();
            $table->unsignedInteger('qty');
            $table->timestamps();

            $table->unique(['receiving_line_id', 'valet_id']);
        });

        Schema::create('stock_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('receiving_document_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('valet_id')->constrained()->restrictOnDelete();
            $table->foreignId('product_id')->constrained()->restrictOnDelete();
            $table->foreignId('batch_id')->constrained()->restrictOnDelete();
            $table->integer('qty_delta');
            $table->string('movement_type', 32);
            $table->foreignId('created_by')->constrained('users')->restrictOnDelete();
            $table->timestamps();

            $table->index(['product_id', 'batch_id', 'created_at']);
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE receiving_lines ADD CONSTRAINT receiving_lines_quantities_positive CHECK (qty_delivery_note > 0 AND qty_physical > 0)');
            DB::statement('ALTER TABLE receiving_allocations ADD CONSTRAINT receiving_allocations_qty_positive CHECK (qty > 0)');
            DB::statement('ALTER TABLE stock_movements ADD CONSTRAINT stock_movements_delta_nonzero CHECK (qty_delta <> 0)');
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_movements');
        Schema::dropIfExists('receiving_allocations');
        Schema::dropIfExists('receiving_lines');
        Schema::dropIfExists('receiving_documents');
    }
};
