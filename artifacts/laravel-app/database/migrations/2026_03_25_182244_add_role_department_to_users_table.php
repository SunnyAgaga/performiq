<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['admin', 'manager', 'employee'])->default('employee')->after('email');
            $table->string('department')->nullable()->after('role');
            $table->string('position')->nullable()->after('department');
            $table->unsignedBigInteger('manager_id')->nullable()->after('position');
            $table->foreign('manager_id')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['manager_id']);
            $table->dropColumn(['role', 'department', 'position', 'manager_id']);
        });
    }
};
