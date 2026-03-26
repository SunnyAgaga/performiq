<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Appraisal extends Model
{
    protected $fillable = [
        'employee_id', 'reviewer_id', 'cycle_id', 'status',
        'self_rating', 'manager_rating', 'final_rating',
        'self_comments', 'manager_comments', 'overall_comments',
        'submitted_at', 'completed_at',
    ];

    protected $casts = [
        'submitted_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function employee()
    {
        return $this->belongsTo(User::class, 'employee_id');
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewer_id');
    }

    public function cycle()
    {
        return $this->belongsTo(AppraisalCycle::class, 'cycle_id');
    }

    public function scores()
    {
        return $this->hasMany(AppraisalScore::class);
    }

    public function goals()
    {
        return $this->hasMany(Goal::class);
    }

    public function getStatusLabelAttribute(): string
    {
        return match($this->status) {
            'pending'        => 'Pending',
            'self_review'    => 'Self Review',
            'manager_review' => 'Manager Review',
            'completed'      => 'Completed',
            default          => ucfirst($this->status),
        };
    }

    public function getStatusBadgeAttribute(): string
    {
        return match($this->status) {
            'pending'        => 'bg-yellow-100 text-yellow-800',
            'self_review'    => 'bg-blue-100 text-blue-800',
            'manager_review' => 'bg-purple-100 text-purple-800',
            'completed'      => 'bg-green-100 text-green-800',
            default          => 'bg-gray-100 text-gray-800',
        };
    }

    public function getRatingLabelAttribute(): string
    {
        $rating = $this->final_rating ?? $this->manager_rating ?? $this->self_rating;
        if (!$rating) return 'N/A';
        if ($rating >= 4.5) return 'Outstanding';
        if ($rating >= 3.5) return 'Exceeds Expectations';
        if ($rating >= 2.5) return 'Meets Expectations';
        if ($rating >= 1.5) return 'Needs Improvement';
        return 'Unsatisfactory';
    }
}
