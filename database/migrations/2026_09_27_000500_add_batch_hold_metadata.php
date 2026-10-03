<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('batches', function (Blueprint $table): void {
            $table->text('hold_reason')->nullable()->after('status');
            $table->foreignId('held_by')->nullable()->after('hold_reason')->constrained('users')->nullOnDelete();
            $table->timestampTz('held_at')->nullable()->after('held_by');
        });
    }

    public function down(): void
    {
        Schema::table('batches', function (Blueprint $table): void {
            $table->dropForeign(['held_by']);
            $table->dropColumn(['hold_reason', 'held_by', 'held_at']);
        });
    }
};
