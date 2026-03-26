<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('appraisal_scores', function (Blueprint $table) {
            $table->id();
            $table->foreignId('appraisal_id')->constrained()->cascadeOnDelete();
            $table->foreignId('criteria_id')->constrained()->cascadeOnDelete();
            $table->unsignedTinyInteger('self_score')->nullable();
            $table->unsignedTinyInteger('manager_score')->nullable();
            $table->text('self_comment')->nullable();
            $table->text('manager_comment')->nullable();
            $table->timestamps();
            $table->unique(['appraisal_id', 'criteria_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('appraisal_scores');
    }
};
