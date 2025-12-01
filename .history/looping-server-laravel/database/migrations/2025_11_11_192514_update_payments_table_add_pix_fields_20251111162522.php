<?php
// database/migrations/2025_11_11_191211_update_payments_table_add_pix_fields.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('payments', function (Blueprint $table) {
            // Add missing PIX columns
            if (!Schema::hasColumn('payments', 'pix_qr_code')) {
                $table->text('pix_qr_code')->nullable()->after('customer_cpf');
            }
            
            if (!Schema::hasColumn('payments', 'pix_code')) {
                $table->text('pix_code')->nullable()->after('pix_qr_code');
            }
            
            if (!Schema::hasColumn('payments', 'expires_at')) {
                $table->timestamp('expires_at')->nullable()->after('pix_code');
            }
            
            // Add indexes if missing
            $sm = Schema::getConnection()->getDoctrineSchemaManager();
            $indexes = $sm->listTableIndexes('payments');
            
            if (!isset($indexes['payments_status_expires_at_index'])) {
                $table->index(['status', 'expires_at']);
            }
        });
    }

    public function down()
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn(['pix_qr_code', 'pix_code', 'expires_at']);
            $table->dropIndex(['status', 'expires_at']);
        });
    }
};