<?php

namespace App\Http\Controllers;

use App\Models\Appraisal;
use App\Models\AppraisalCycle;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $activeCycle = AppraisalCycle::active()->latest()->first();

        if ($user->isAdmin()) {
            $totalEmployees = User::where('role', 'employee')->count();
            $totalManagers  = User::where('role', 'manager')->count();
            $totalCycles    = AppraisalCycle::count();
            $appraisals     = Appraisal::with(['employee', 'cycle'])->latest()->take(10)->get();
            $completedCount = Appraisal::where('status', 'completed')->count();
            $pendingCount   = Appraisal::where('status', 'pending')->count();

            return view('dashboard.admin', compact(
                'totalEmployees', 'totalManagers', 'totalCycles',
                'appraisals', 'activeCycle', 'completedCount', 'pendingCount'
            ));
        }

        if ($user->isManager()) {
            $teamMembers = $user->directReports()->with('appraisals')->get();
            $myAppraisal = $activeCycle ? $user->getAppraisalForCycle($activeCycle) : null;
            $pendingReviews = Appraisal::where('reviewer_id', $user->id)
                ->where('status', 'manager_review')->count();

            return view('dashboard.manager', compact(
                'teamMembers', 'activeCycle', 'myAppraisal', 'pendingReviews'
            ));
        }

        // Employee
        $myAppraisals = $user->appraisals()->with('cycle')->latest()->get();
        $myAppraisal  = $activeCycle ? $user->getAppraisalForCycle($activeCycle) : null;

        return view('dashboard.employee', compact('myAppraisals', 'activeCycle', 'myAppraisal'));
    }
}
