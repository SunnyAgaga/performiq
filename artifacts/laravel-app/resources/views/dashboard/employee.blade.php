<x-app-layout title="Dashboard" subtitle="Welcome back, {{ Auth::user()->name }}">
    @if($activeCycle && !$myAppraisal)
    <div class="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
        <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        <p class="text-sm text-blue-800">The active cycle <strong>{{ $activeCycle->name }}</strong> is open. Your appraisal will be created by your manager or HR.</p>
    </div>
    @endif

    @if($myAppraisal)
    <div class="mb-6 bg-white rounded-xl border border-gray-200 p-5">
        <div class="flex items-center justify-between mb-3">
            <h2 class="font-semibold text-gray-900">Current Appraisal — {{ $activeCycle->name }}</h2>
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {{ $myAppraisal->status_badge }}">
                {{ $myAppraisal->status_label }}
            </span>
        </div>

        @if($myAppraisal->status === 'self_review' || $myAppraisal->status === 'pending')
        <p class="text-sm text-gray-600 mb-4">It's time to complete your self-assessment for this cycle.</p>
        <a href="{{ route('appraisals.edit', $myAppraisal) }}" class="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
            Start Self Review →
        </a>
        @elseif($myAppraisal->status === 'manager_review')
        <p class="text-sm text-gray-600">Your self-review has been submitted. Awaiting manager review.</p>
        @elseif($myAppraisal->status === 'completed')
        <div class="grid grid-cols-3 gap-4 mt-3">
            <div class="text-center">
                <p class="text-xs text-gray-500">Self Rating</p>
                <p class="text-xl font-bold text-gray-900">{{ number_format($myAppraisal->self_rating ?? 0, 1) }}</p>
            </div>
            <div class="text-center">
                <p class="text-xs text-gray-500">Manager Rating</p>
                <p class="text-xl font-bold text-gray-900">{{ number_format($myAppraisal->manager_rating ?? 0, 1) }}</p>
            </div>
            <div class="text-center">
                <p class="text-xs text-gray-500">Final Rating</p>
                <p class="text-xl font-bold text-indigo-600">{{ number_format($myAppraisal->final_rating ?? 0, 1) }}</p>
            </div>
        </div>
        <a href="{{ route('appraisals.show', $myAppraisal) }}" class="inline-block mt-4 text-sm text-indigo-600 hover:underline font-medium">View full appraisal →</a>
        @endif
    </div>
    @endif

    <div class="bg-white rounded-xl border border-gray-200">
        <div class="px-5 py-4 border-b border-gray-100">
            <h2 class="font-semibold text-gray-900">My Appraisal History</h2>
        </div>
        <div class="overflow-x-auto">
            <table class="w-full text-sm">
                <thead>
                    <tr class="bg-gray-50 text-left">
                        <th class="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Cycle</th>
                        <th class="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                        <th class="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Final Rating</th>
                        <th class="px-5 py-3 text-xs font-semibold text-gray-500 uppercase"></th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    @forelse($myAppraisals as $appraisal)
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
</x-app-layout>
