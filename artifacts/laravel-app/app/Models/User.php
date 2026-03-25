<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    protected $fillable = [
        'name', 'email', 'password', 'role', 'department', 'position', 'manager_id',
    ];

    protected $hidden = [
        'password', 'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function isAdmin(): bool { return $this->role === 'admin'; }
    public function isManager(): bool { return $this->role === 'manager'; }
    public function isEmployee(): bool { return $this->role === 'employee'; }

    public function manager()
    {
        return $this->belongsTo(User::class, 'manager_id');
    }

    public function directReports()
    {
        return $this->hasMany(User::class, 'manager_id');
    }

    public function appraisals()
    {
        return $this->hasMany(Appraisal::class, 'employee_id');
    }

    public function reviewedAppraisals()
    {
        return $this->hasMany(Appraisal::class, 'reviewer_id');
    }

    public function getAppraisalForCycle(AppraisalCycle $cycle)
    {
        return $this->appraisals()->where('cycle_id', $cycle->id)->first();
    }
}
