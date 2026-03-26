<x-app-layout title="Employees & Users">
    <x-slot name="actions">
        <a href="{{ route('users.create') }}" class="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            Add User
        </a>
    </x-slot>

    <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table class="w-full text-sm">
            <thead>
                <tr class="bg-gray-50 text-left">
                    <th class="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Name</th>
                    <th class="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Role</th>
                    <th class="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Department</th>
                    <th class="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Manager</th>
                    <th class="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Appraisals</th>
                    <th class="px-5 py-3 text-xs font-semibold text-gray-500 uppercase"></th>
                </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
                @forelse($users as $user)
                <tr class="hover:bg-gray-50">
                    <td class="px-5 py-3">
                        <div class="font-medium text-gray-900">{{ $user->name }}</div>
                        <div class="text-gray-500 text-xs">{{ $user->email }}</div>
                    </td>
                    <td class="px-5 py-3">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                            {{ $user->role === 'admin' ? 'bg-red-100 text-red-800' :
                               ($user->role === 'manager' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800') }}">
                            {{ ucfirst($user->role) }}
                        </span>
                    </td>
                    <td class="px-5 py-3 text-gray-600">{{ $user->department ?? '—' }}</td>
                    <td class="px-5 py-3 text-gray-600">{{ $user->manager?->name ?? '—' }}</td>
                    <td class="px-5 py-3 text-gray-600">{{ $user->appraisals_count }}</td>
                    <td class="px-5 py-3 text-right">
                        <div class="flex items-center justify-end gap-3">
                            <a href="{{ route('users.show', $user) }}" class="text-indigo-600 hover:underline text-xs">View</a>
                            <a href="{{ route('users.edit', $user) }}" class="text-gray-600 hover:underline text-xs">Edit</a>
                            @if(Auth::id() !== $user->id)
                            <form method="POST" action="{{ route('users.destroy', $user) }}" onsubmit="return confirm('Delete this user?')">
                                @csrf @method('DELETE')
                                <button type="submit" class="text-red-500 hover:underline text-xs">Delete</button>
                            </form>
                            @endif
                        </div>
                    </td>
                </tr>
                @empty
                <tr><td colspan="6" class="px-5 py-8 text-center text-gray-400">No users found.</td></tr>
                @endforelse
            </tbody>
        </table>
    </div>
    <div class="mt-4">{{ $users->links() }}</div>
</x-app-layout>
