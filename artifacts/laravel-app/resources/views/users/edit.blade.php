<x-app-layout title="Edit User">
    <div class="max-w-2xl">
        <div class="bg-white rounded-xl border border-gray-200 p-6">
            <form method="POST" action="{{ route('users.update', $user) }}" class="space-y-5">
                @csrf @method('PUT')
                <div class="grid grid-cols-2 gap-4">
                    <div class="col-span-2">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input type="text" name="name" value="{{ old('name', $user->name) }}" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500" required>
                    </div>
                    <div class="col-span-2">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input type="email" name="email" value="{{ old('email', $user->email) }}" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500" required>
                    </div>
                    <div class="col-span-2">
                        <label class="block text-sm font-medium text-gray-700 mb-1">New Password <span class="text-gray-400 font-normal">(leave blank to keep current)</span></label>
                        <input type="password" name="password" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500" minlength="8">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Role</label>
                        <select name="role" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500" required>
                            <option value="employee" @selected(old('role', $user->role) === 'employee')>Employee</option>
                            <option value="manager" @selected(old('role', $user->role) === 'manager')>Manager</option>
                            <option value="admin" @selected(old('role', $user->role) === 'admin')>Admin</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Manager</label>
                        <select name="manager_id" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500">
                            <option value="">None</option>
                            @foreach($managers as $mgr)
                                <option value="{{ $mgr->id }}" @selected(old('manager_id', $user->manager_id) == $mgr->id)>{{ $mgr->name }}</option>
                            @endforeach
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Department</label>
                        <input type="text" name="department" value="{{ old('department', $user->department) }}" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Position</label>
                        <input type="text" name="position" value="{{ old('position', $user->position) }}" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500">
                    </div>
                </div>
                <div class="flex gap-3 pt-2">
                    <button type="submit" class="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition">Save Changes</button>
                    <a href="{{ route('users.index') }}" class="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium px-5 py-2 rounded-lg transition">Cancel</a>
                </div>
            </form>
        </div>
    </div>
</x-app-layout>
