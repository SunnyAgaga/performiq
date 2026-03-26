<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Goal extends Model
{
    protected $fillable = [
        'appraisal_id', 'title', 'description', 'target_date', 'weight',
        'status', 'self_achievement', 'manager_achievement',
        'self_comment', 'manager_comment',
    ];

    protected $casts = [
        'target_date' => 'date',
    ];

    public function appraisal()
    {
        return $this->belongsTo(Appraisal::class);
    }

    public function getStatusBadgeAttribute(): string
    {
        return match($this->status) {
            'not_started' => 'bg-gray-100 text-gray-800',
            'in_progress' => 'bg-blue-100 text-blue-800',
            'completed'   => 'bg-green-100 text-green-800',
            'cancelled'   => 'bg-red-100 text-red-800',
            default       => 'bg-gray-100 text-gray-800',
        };
    }
}
