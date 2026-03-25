<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index()
    {
        $users = User::withCount('appraisals')->orderBy('name')->paginate(20);
        return view('users.index', compact('users'));
    }

    public function create()
    {
        $managers = User::where('role', 'manager')->orderBy('name')->get();
        return view('users.create', compact('managers'));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'       => 'required|string|max:255',
            'email'      => 'required|email|unique:users,email',
            'password'   => 'required|string|min:8',
            'role'       => 'required|in:admin,manager,employee',
            'department' => 'nullable|string|max:100',
            'position'   => 'nullable|string|max:100',
            'manager_id' => 'nullable|exists:users,id',
        ]);

        $data['password'] = Hash::make($data['password']);
        User::create($data);

        return redirect()->route('users.index')->with('success', 'User created successfully.');
    }

    public function show(User $user)
    {
        $user->load(['appraisals.cycle', 'manager', 'directReports']);
        return view('users.show', compact('user'));
    }

    public function edit(User $user)
    {
        $managers = User::where('role', 'manager')->where('id', '!=', $user->id)->orderBy('name')->get();
        return view('users.edit', compact('user', 'managers'));
    }

    public function update(Request $request, User $user)
    {
        $data = $request->validate([
            'name'       => 'required|string|max:255',
            'email'      => 'required|email|unique:users,email,' . $user->id,
            'role'       => 'required|in:admin,manager,employee',
            'department' => 'nullable|string|max:100',
            'position'   => 'nullable|string|max:100',
            'manager_id' => 'nullable|exists:users,id',
            'password'   => 'nullable|string|min:8',
        ]);

        if (empty($data['password'])) {
            unset($data['password']);
        } else {
            $data['password'] = Hash::make($data['password']);
        }

        $user->update($data);
        return redirect()->route('users.index')->with('success', 'User updated successfully.');
    }

    public function destroy(User $user)
    {
        $user->delete();
        return redirect()->route('users.index')->with('success', 'User deleted.');
    }
}
