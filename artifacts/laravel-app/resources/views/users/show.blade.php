<x-app-layout title="{{ $user->name }}" subtitle="{{ $user->position }} · {{ $user->department }}">
    <x-slot name="actions">
        <a href="{{ route('users.edit', $user) }}" class="inline-flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg transition">Edit</a>
    </x-slot>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="space-y-4">
            <div class="bg-white rounded-xl border border-gray-200 p-5">
                <div class="flex items-center gap-4 mb-4">
                    <div class="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                        {{ strtoupper(substr($user->name, 0, 2)) }}
                    </div>
                    <div>
                        <p class="font-semibold text-gray-900">{{ $user->name }}</p>
                        <p class="text-sm text-gray-500">{{ $user->email }}</p>
                    </div>
                </div>
                <div class="space-y-2 text-sm">
                    <div class="flex justify-between">
                        <span class="text-gray-500">Role</span>
                        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium {{ $user->role === 'admin' ? 'bg-red-100 text-red-800' : ($user->role === 'manager' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800') }}">{{ ucfirst($user->role) }}</span>
                    </div>
                    <div class="flex justify-between text-gray-600"><span class="text-gray-500">Department</span><span>{{ $user->department ?? '—' }}</span></div>
                    <div class="flex justify-between text-gray-600"><span class="text-gray-500">Position</span><span>{{ $user->position ?? '—' }}</span></div>
                    <div class="flex justify-between text-gray-600"><span class="text-gray-500">Manager</span><span>{{ $user->manager?->name ?? '—' }}</span></div>
                </div>
            </div>

            @if($user->directReports->isNotEmpty())
            <div class="bg-white rounded-xl border border-gray-200 p-5">
                <h3 class="text-sm font-semibold text-gray-900 mb-3">Direct Reports ({{ $user->directReports->count() }})</h3>
                <ul class="space-y-2">
                    @foreach($user->directReports as $report)
                    <li><a href="{{ route('users.show', $report) }}" class="text-sm text-indigo-600 hover:underline">{{ $report->name }}</a></li>
                    @endforeach
                </ul>
            </div>
            @endif
        </div>

        <div class="lg:col-span-2">
            <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 class="font-semibold text-gray-900">Appraisal History</h2>
                    <a href="{{ route('appraisals.create') }}" class="text-sm text-indigo-600 hover:underline">New Appraisal</a>
                </div>
                <table class="w-full text-sm">
                    <thead>
                        <tr class="bg-gray-50 text-left">
                            <th class="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Cycle</th>
                            <th class="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                            <th class="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Rating</th>
                            <th class="px-5 py-3 text-xs font-semibold text-gray-500 uppercase"></th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                        @forelse($user->appraisals as $appraisal)
                        <tr class="hover:bg-gray-50">
                            <td class="px-5 py-3 font-medium text-gray-900">{{ $appraisal->cycle->name ?? '—' }}</td>
                            <td class="px-5 py-3">
                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {{ $appraisal->status_badge }}">
                                    {{ $appraisal->status_label }}
                                </span>
                            </td>
                            <td class="px-5 py-3 text-gray-600">{{ $appraisal->final_rating ? number_format($appraisal->final_rating, 1) . ' / 5' : '—' }}</td>
                            <td class="px-5 py-3 text-right">
                                <a href="{{ route('appraisals.show', $appraisal) }}" class="text-indigo-600 hover:underline text-xs font-medium">View</a>
                            </td>
                        </tr>
                        @empty
                        <tr><td colspan="4" class="px-5 py-8 text-center text-gray-400">No appraisals yet.</td></tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</x-app-layout>
