<?php

namespace App\Http\Controllers;

use App\Models\Appraisal;
use App\Models\Goal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class GoalController extends Controller
{
    public function store(Request $request, Appraisal $appraisal)
    {
        $data = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'target_date' => 'nullable|date',
            'weight'      => 'required|integer|min:1|max:100',
        ]);

        $appraisal->goals()->create(array_merge($data, ['status' => 'not_started']));

        return redirect()->route('appraisals.edit', $appraisal)->with('success', 'Goal added.');
    }

    public function destroy(Goal $goal)
    {
        $appraisal = $goal->appraisal;
        $goal->delete();
        return redirect()->route('appraisals.edit', $appraisal)->with('success', 'Goal removed.');
    }

    public function index() {}
    public function create() {}
    public function show(string $id) {}
    public function edit(string $id) {}
    public function update(Request $request, string $id) {}
}
