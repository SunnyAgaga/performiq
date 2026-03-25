<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AppraisalScore extends Model
{
    protected $fillable = [
        'appraisal_id', 'criteria_id',
        'self_score', 'manager_score',
        'self_comment', 'manager_comment',
    ];

    public function appraisal()
    {
        return $this->belongsTo(Appraisal::class);
    }

    public function criteria()
    {
        return $this->belongsTo(Criteria::class);
    }
}
