<x-app-layout title="Dashboard" subtitle="Welcome back, {{ Auth::user()->name }}">
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div class="bg-white rounded-xl border border-gray-200 p-5">
            <p class="text-sm text-gray-500">Team Members</p>
            <p class="text-2xl font-bold text-gray-900 mt-1">{{ $teamMembers->count() }}</p>
        </div>
        <div class="bg-white rounded-xl border border-gray-200 p-5">
            <p class="text-sm text-gray-500">Pending Reviews</p>
            <p class="text-2xl font-bold text-yellow-600 mt-1">{{ $pendingReviews }}</p>
        </div>
        <div class="bg-white rounded-xl border border-gray-200 p-5">
            <p class="text-sm text-gray-500">Active Cycle</p>
            <p class="text-sm font-semibold text-gray-900 mt-1">{{ $activeCycle?->name ?? 'None' }}</p>
        </div>
    </div>

    @if($pendingReviews > 0)
    <div class="mb-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-3">
        <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
        <p class="text-sm font-medium text-yellow-800">You have {{ $pendingReviews }} appraisal(s) awaiting your manager review.</p>
        <a href="{{ route('appraisals.index') }}" class="ml-auto text-sm text-yellow-700 font-semibold hover:underline">Review now →</a>
    </div>
    @endif

    <div class="bg-white rounded-xl border border-gray-200">
        <div class="px-5 py-4 border-b border-gray-100">
            <h2 class="font-semibold text-gray-900">My Team</h2>
        </div>
        <div class="overflow-x-auto">
            <table class="w-full text-sm">
                <thead>
                    <tr class="bg-gray-50 text-left">
                        <th class="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Employee</th>
                        <th class="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Department</th>
                        <th class="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Current Cycle Status</th>
                        <th class="px-5 py-3 text-xs font-semibold text-gray-500 uppercase"></th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    @forelse($teamMembers as $member)
                    @php $appraisal = $activeCycle ? $member->getAppraisalForCycle($activeCycle) : null; @endphp
                    <tr class="hover:bg-gray-50">
                        <td class="px-5 py-3">
                            <div class="font-medium text-gray-900">{{ $member->name }}</div>
                            <div class="text-gray-500 text-xs">{{ $member->position }}</div>
                        </td>
                        <td class="px-5 py-3 text-gray-600">{{ $member->department }}</td>
                        <td class="px-5 py-3">
                            @if($appraisal)
                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {{ $appraisal->status_badge }}">
                                    {{ $appraisal->status_label }}
                                </span>
                            @else
                                <span class="text-gray-400 text-xs">No appraisal</span>
                            @endif
                        </td>
                        <td class="px-5 py-3 text-right">
                            @if($appraisal)
                                <a href="{{ route('appraisals.show', $appraisal) }}" class="text-indigo-600 hover:underline text-xs font-medium">View</a>
                            @endif
                        </td>
                    </tr>
                    @empty
                    <tr><td colspan="4" class="px-5 py-8 text-center text-gray-400">No team members assigned.</td></tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>
</x-app-layout>
