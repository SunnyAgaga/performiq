<?php

namespace App\Http\Controllers;

use App\Models\AppraisalCycle;
use Illuminate\Http\Request;

class AppraisalCycleController extends Controller
{
    public function index()
    {
        $cycles = AppraisalCycle::withCount('appraisals')->latest()->get();
        return view('cycles.index', compact('cycles'));
    }

    public function create()
    {
        return view('cycles.create');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'        => 'required|string|max:255',
            'year'        => 'required|integer|min:2000|max:2100',
            'start_date'  => 'required|date',
            'end_date'    => 'required|date|after:start_date',
            'description' => 'nullable|string',
        ]);

        AppraisalCycle::create($data);
        return redirect()->route('cycles.index')->with('success', 'Appraisal cycle created successfully.');
    }

    public function show(AppraisalCycle $cycle)
    {
        $appraisals = $cycle->appraisals()->with('employee', 'reviewer')->get();
        return view('cycles.show', compact('cycle', 'appraisals'));
    }

    public function edit(AppraisalCycle $cycle)
    {
        return view('cycles.edit', compact('cycle'));
    }

    public function update(Request $request, AppraisalCycle $cycle)
    {
        $data = $request->validate([
            'name'        => 'required|string|max:255',
            'year'        => 'required|integer|min:2000|max:2100',
            'start_date'  => 'required|date',
            'end_date'    => 'required|date|after:start_date',
            'status'      => 'required|in:draft,active,closed',
            'description' => 'nullable|string',
        ]);

        $cycle->update($data);
        return redirect()->route('cycles.index')->with('success', 'Cycle updated successfully.');
    }

    public function destroy(AppraisalCycle $cycle)
    {
        $cycle->delete();
        return redirect()->route('cycles.index')->with('success', 'Cycle deleted successfully.');
    }
}
