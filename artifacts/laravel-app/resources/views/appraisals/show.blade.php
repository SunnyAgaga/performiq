<x-app-layout title="Appraisal Details">
    <x-slot name="subtitle">{{ $appraisal->employee->name }} — {{ $appraisal->cycle->name ?? '' }}</x-slot>
    <x-slot name="actions">
        @if($appraisal->status !== 'completed')
        <a href="{{ route('appraisals.edit', $appraisal) }}" class="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
            {{ Auth::id() === $appraisal->employee_id ? 'Complete Self-Review' : 'Review' }}
        </a>
        @endif
    </x-slot>

    {{-- Status bar --}}
    <div class="flex items-center gap-2 mb-6">
        @foreach(['pending' => 'Pending', 'self_review' => 'Self Review', 'manager_review' => 'Manager Review', 'completed' => 'Completed'] as $s => $label)
        <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                {{ in_array($appraisal->status, ['self_review','manager_review','completed']) && $s === 'pending' ? 'bg-indigo-600 text-white' :
                   ($appraisal->status === $s ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500') }}">
                {{ $loop->iteration }}
            </div>
            <span class="text-xs font-medium {{ $appraisal->status === $s ? 'text-indigo-600' : 'text-gray-400' }}">{{ $label }}</span>
        </div>
        @if(!$loop->last)<div class="flex-1 h-px bg-gray-200 mx-2"></div>@endif
        @endforeach
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {{-- Main --}}
        <div class="lg:col-span-2 space-y-6">
            {{-- Scores --}}
            @if($appraisal->scores->isNotEmpty())
            <div class="bg-white rounded-xl border border-gray-200">
                <div class="px-5 py-4 border-b border-gray-100">
                    <h2 class="font-semibold text-gray-900">Competency Scores</h2>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead>
                            <tr class="bg-gray-50 text-left">
                                <th class="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Criteria</th>
                                <th class="px-5 py-3 text-xs font-semibold text-gray-500 uppercase text-center">Self</th>
                                <th class="px-5 py-3 text-xs font-semibold text-gray-500 uppercase text-center">Manager</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100">
                            @foreach($appraisal->scores as $score)
                            <tr>
                                <td class="px-5 py-3">
                                    <div class="font-medium text-gray-900">{{ $score->criteria->name }}</div>
                                    @if($score->self_comment)<div class="text-xs text-gray-500 mt-0.5">{{ $score->self_comment }}</div>@endif
                                </td>
                                <td class="px-5 py-3 text-center">
                                    @if($score->self_score !== null)
                                        <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-semibold text-sm">{{ $score->self_score }}</span>
                                    @else <span class="text-gray-300">—</span> @endif
                                </td>
                                <td class="px-5 py-3 text-center">
                                    @if($score->manager_score !== null)
                                        <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-800 font-semibold text-sm">{{ $score->manager_score }}</span>
                                    @else <span class="text-gray-300">—</span> @endif
                                </td>
                            </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
            </div>
            @endif

            {{-- Goals --}}
            @if($appraisal->goals->isNotEmpty())
            <div class="bg-white rounded-xl border border-gray-200">
                <div class="px-5 py-4 border-b border-gray-100">
                    <h2 class="font-semibold text-gray-900">Goals</h2>
                </div>
                <div class="divide-y divide-gray-100">
                    @foreach($appraisal->goals as $goal)
                    <div class="px-5 py-4">
                        <div class="flex items-start justify-between gap-4">
                            <div class="flex-1">
                                <p class="font-medium text-gray-900">{{ $goal->title }}</p>
                                @if($goal->description)<p class="text-sm text-gray-500 mt-0.5">{{ $goal->description }}</p>@endif
                            </div>
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {{ $goal->status_badge }}">
                                {{ ucfirst(str_replace('_', ' ', $goal->status)) }}
                            </span>
                        </div>
                        <div class="mt-2 grid grid-cols-2 gap-4 text-xs text-gray-500">
                            @if($goal->self_achievement !== null)<div>Self: <strong class="text-gray-900">{{ $goal->self_achievement }}%</strong></div>@endif
                            @if($goal->manager_achievement !== null)<div>Manager: <strong class="text-gray-900">{{ $goal->manager_achievement }}%</strong></div>@endif
                        </div>
                    </div>
                    @endforeach
                </div>
            </div>
            @endif

            {{-- Comments --}}
            @if($appraisal->self_comments || $appraisal->manager_comments)
            <div class="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
                @if($appraisal->self_comments)
                <div>
                    <p class="text-xs font-semibold text-gray-500 uppercase mb-1">Self Comments</p>
                    <p class="text-sm text-gray-700">{{ $appraisal->self_comments }}</p>
                </div>
                @endif
                @if($appraisal->manager_comments)
                <div>
                    <p class="text-xs font-semibold text-gray-500 uppercase mb-1">Manager Comments</p>
                    <p class="text-sm text-gray-700">{{ $appraisal->manager_comments }}</p>
                </div>
                @endif
            </div>
            @endif
        </div>

        {{-- Sidebar --}}
        <div class="space-y-4">
            <div class="bg-white rounded-xl border border-gray-200 p-5">
                <h3 class="text-sm font-semibold text-gray-900 mb-3">Ratings Summary</h3>
                <div class="space-y-3">
                    <div class="flex items-center justify-between">
                        <span class="text-sm text-gray-600">Self Rating</span>
                        <span class="font-semibold text-gray-900">{{ $appraisal->self_rating ? number_format($appraisal->self_rating, 1) . ' / 5' : '—' }}</span>
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-sm text-gray-600">Manager Rating</span>
                        <span class="font-semibold text-gray-900">{{ $appraisal->manager_rating ? number_format($appraisal->manager_rating, 1) . ' / 5' : '—' }}</span>
                    </div>
                    <div class="border-t border-gray-100 pt-3 flex items-center justify-between">
                        <span class="text-sm font-medium text-gray-900">Final Rating</span>
                        <span class="text-xl font-bold text-indigo-600">{{ $appraisal->final_rating ? number_format($appraisal->final_rating, 1) : '—' }}</span>
                    </div>
                    @if($appraisal->final_rating)
                    <p class="text-xs text-center text-gray-500">{{ $appraisal->rating_label }}</p>
                    @endif
                </div>
            </div>

            <div class="bg-white rounded-xl border border-gray-200 p-5 space-y-2 text-sm">
                <div class="flex justify-between text-gray-600">
                    <span>Employee</span>
                    <span class="font-medium text-gray-900">{{ $appraisal->employee->name }}</span>
                </div>
                <div class="flex justify-between text-gray-600">
                    <span>Reviewer</span>
                    <span class="font-medium text-gray-900">{{ $appraisal->reviewer?->name ?? '—' }}</span>
                </div>
                @if($appraisal->submitted_at)
                <div class="flex justify-between text-gray-600">
                    <span>Submitted</span>
                    <span class="font-medium text-gray-900">{{ $appraisal->submitted_at->format('M d, Y') }}</span>
                </div>
                @endif
                @if($appraisal->completed_at)
                <div class="flex justify-between text-gray-600">
                    <span>Completed</span>
                    <span class="font-medium text-gray-900">{{ $appraisal->completed_at->format('M d, Y') }}</span>
                </div>
                @endif
            </div>
        </div>
    </div>
</x-app-layout>
