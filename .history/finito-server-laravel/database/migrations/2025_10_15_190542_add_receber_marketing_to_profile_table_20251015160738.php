<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('profile', function (Blueprint $table) {
            $table->boolean('receber_marketing')->default(true)->after('avatar');
        });
    }

    public function down()
    {
        Schema::table('profile', function (Blueprint $table) {
            $table->dropColumn('receber_marketing');
        });
    }
};