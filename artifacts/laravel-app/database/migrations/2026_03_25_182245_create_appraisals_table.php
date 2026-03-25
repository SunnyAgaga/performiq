<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('appraisals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('reviewer_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('cycle_id')->constrained('appraisal_cycles')->cascadeOnDelete();
            $table->enum('status', ['pending', 'self_review', 'manager_review', 'completed'])->default('pending');
            $table->decimal('self_rating', 4, 2)->nullable();
            $table->decimal('manager_rating', 4, 2)->nullable();
            $table->decimal('final_rating', 4, 2)->nullable();
            $table->text('self_comments')->nullable();
            $table->text('manager_comments')->nullable();
            $table->text('overall_comments')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            $table->unique(['employee_id', 'cycle_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('appraisals');
    }
};
