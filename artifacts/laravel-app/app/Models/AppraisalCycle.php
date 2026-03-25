<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AppraisalCycle extends Model
{
    protected $fillable = ['name', 'year', 'start_date', 'end_date', 'status', 'description'];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public function appraisals()
    {
        return $this->hasMany(Appraisal::class, 'cycle_id');
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function getStatusBadgeAttribute(): string
    {
        return match($this->status) {
            'draft'  => 'bg-gray-100 text-gray-800',
            'active' => 'bg-green-100 text-green-800',
            'closed' => 'bg-red-100 text-red-800',
            default  => 'bg-gray-100 text-gray-800',
        };
    }
}
