<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Criteria extends Model
{
    protected $table = 'criteria';

    protected $fillable = ['name', 'description', 'category', 'max_score', 'weight', 'is_active'];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function scores()
    {
        return $this->hasMany(AppraisalScore::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
