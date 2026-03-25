<?php

namespace App\Http\Controllers;

use App\Models\Appraisal;
use App\Models\AppraisalCycle;
use App\Models\AppraisalScore;
use App\Models\Criteria;
use App\Models\Goal;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AppraisalController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        if ($user->isAdmin()) {
            $appraisals = Appraisal::with(['employee', 'reviewer', 'cycle'])->latest()->paginate(20);
        } elseif ($user->isManager()) {
            $teamIds = $user->directReports()->pluck('id');
            $appraisals = Appraisal::with(['employee', 'cycle'])
                ->whereIn('employee_id', $teamIds)
                ->latest()->paginate(20);
        } else {
            $appraisals = $user->appraisals()->with('cycle')->latest()->paginate(20);
        }

        return view('appraisals.index', compact('appraisals'));
    }

    public function create()
    {
        $cycles    = AppraisalCycle::active()->get();
        $employees = User::where('role', 'employee')->orderBy('name')->get();
        return view('appraisals.create', compact('cycles', 'employees'));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'employee_id' => 'required|exists:users,id',
            'cycle_id'    => 'required|exists:appraisal_cycles,id',
            'reviewer_id' => 'nullable|exists:users,id',
        ]);

        $exists = Appraisal::where('employee_id', $data['employee_id'])
            ->where('cycle_id', $data['cycle_id'])->exists();

        if ($exists) {
            return back()->withErrors(['employee_id' => 'An appraisal already exists for this employee in this cycle.']);
        }

        $appraisal = Appraisal::create(array_merge($data, ['status' => 'pending']));

        // Pre-populate scores for active criteria
        foreach (Criteria::active()->get() as $criterion) {
            AppraisalScore::create([
                'appraisal_id' => $appraisal->id,
                'criteria_id'  => $criterion->id,
            ]);
        }

        return redirect()->route('appraisals.show', $appraisal)->with('success', 'Appraisal created.');
    }

    public function show(Appraisal $appraisal)
    {
        $this->authorizeAppraisal($appraisal);
        $appraisal->load(['employee', 'reviewer', 'cycle', 'scores.criteria', 'goals']);
        return view('appraisals.show', compact('appraisal'));
    }

    public function edit(Appraisal $appraisal)
    {
        $this->authorizeAppraisal($appraisal);
        $appraisal->load(['scores.criteria', 'goals']);
        $criteria = Criteria::active()->get();
        return view('appraisals.edit', compact('appraisal', 'criteria'));
    }

    public function update(Request $request, Appraisal $appraisal)
    {
        $this->authorizeAppraisal($appraisal);
        $user = Auth::user();

        if ($user->isAdmin() || $user->id === $appraisal->reviewer_id) {
            // Manager / Admin update
            $data = $request->validate([
                'manager_comments' => 'nullable|string',
                'overall_comments' => 'nullable|string',
                'reviewer_id'      => 'nullable|exists:users,id',
                'status'           => 'sometimes|in:pending,self_review,manager_review,completed',
            ]);

            foreach ($request->input('manager_scores', []) as $scoreId => $value) {
                AppraisalScore::where('id', $scoreId)->update([
                    'manager_score'   => $value['score'] ?? null,
                    'manager_comment' => $value['comment'] ?? null,
                ]);
            }

            foreach ($request->input('goal_manager', []) as $goalId => $value) {
                Goal::where('id', $goalId)->where('appraisal_id', $appraisal->id)->update([
                    'manager_achievement' => $value['achievement'] ?? null,
                    'manager_comment'     => $value['comment'] ?? null,
                ]);
            }

            if (isset($data['status']) && $data['status'] === 'completed') {
                $managerScores = $appraisal->scores()->whereNotNull('manager_score')->get();
                if ($managerScores->count()) {
                    $data['manager_rating'] = round($managerScores->avg('manager_score'), 2);
                    $data['final_rating']   = $data['manager_rating'];
                }
                $data['completed_at'] = now();
            }

            $appraisal->update($data);
        } else {
            // Self-review by employee
            $data = $request->validate([
                'self_comments' => 'nullable|string',
            ]);

            foreach ($request->input('self_scores', []) as $scoreId => $value) {
                AppraisalScore::where('id', $scoreId)
                    ->where('appraisal_id', $appraisal->id)
                    ->update([
                        'self_score'   => $value['score'] ?? null,
                        'self_comment' => $value['comment'] ?? null,
                    ]);
            }

            foreach ($request->input('goal_self', []) as $goalId => $value) {
                Goal::where('id', $goalId)->where('appraisal_id', $appraisal->id)->update([
                    'self_achievement' => $value['achievement'] ?? null,
                    'self_comment'     => $value['comment'] ?? null,
                    'status'           => $value['status'] ?? 'in_progress',
                ]);
            }

            $selfScores = $appraisal->scores()->whereNotNull('self_score')->get();
            if ($selfScores->count()) {
                $data['self_rating'] = round($selfScores->avg('self_score'), 2);
            }

            if ($request->input('submit') === '1') {
                $data['status']       = 'manager_review';
                $data['submitted_at'] = now();
            } else {
                $data['status'] = 'self_review';
            }

            $appraisal->update($data);
        }

        return redirect()->route('appraisals.show', $appraisal)->with('success', 'Appraisal updated successfully.');
    }

    public function destroy(Appraisal $appraisal)
    {
        $appraisal->delete();
        return redirect()->route('appraisals.index')->with('success', 'Appraisal deleted.');
    }

    private function authorizeAppraisal(Appraisal $appraisal): void
    {
        $user = Auth::user();
        if ($user->isAdmin()) return;
        if ($user->id === $appraisal->employee_id) return;
        if ($user->id === $appraisal->reviewer_id) return;
        abort(403, 'Unauthorized');
    }
}
