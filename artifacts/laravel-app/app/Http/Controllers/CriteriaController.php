<?php

namespace App\Http\Controllers;

use App\Models\Criteria;
use Illuminate\Http\Request;

class CriteriaController extends Controller
{
    public function index()
    {
        $criteria = Criteria::orderBy('category')->orderBy('name')->get();
        $categories = $criteria->pluck('category')->unique()->sort()->values();
        return view('criteria.index', compact('criteria', 'categories'));
    }

    public function create()
    {
        return view('criteria.create');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
            'category'    => 'required|string|max:100',
            'max_score'   => 'required|integer|min:1|max:10',
            'weight'      => 'required|integer|min:1|max:100',
        ]);

        Criteria::create($data);
        return redirect()->route('criteria.index')->with('success', 'Criteria added successfully.');
    }

    public function edit(Criteria $criterion)
    {
        return view('criteria.edit', compact('criterion'));
    }

    public function update(Request $request, Criteria $criterion)
    {
        $data = $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
            'category'    => 'required|string|max:100',
            'max_score'   => 'required|integer|min:1|max:10',
            'weight'      => 'required|integer|min:1|max:100',
            'is_active'   => 'boolean',
        ]);

        $data['is_active'] = $request->boolean('is_active');
        $criterion->update($data);
        return redirect()->route('criteria.index')->with('success', 'Criteria updated successfully.');
    }

    public function destroy(Criteria $criterion)
    {
        $criterion->delete();
        return redirect()->route('criteria.index')->with('success', 'Criteria deleted.');
    }

    public function show(Criteria $criterion) {}
}
