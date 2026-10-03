<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('receiving_documents', function (Blueprint $table): void {
            $table->uuid('finalization_key')->nullable()->unique()->after('finalized_by');
        });

        DB::table('receiving_documents')
            ->whereNull('finalization_key')
            ->orderBy('id')
            ->eachById(function (object $document): void {
                DB::table('receiving_documents')
                    ->where('id', $document->id)
                    ->update(['finalization_key' => (string) Str::uuid()]);
            });
    }

    public function down(): void
    {
        Schema::table('receiving_documents', function (Blueprint $table): void {
            $table->dropUnique(['finalization_key']);
            $table->dropColumn('finalization_key');
        });
    }
};
