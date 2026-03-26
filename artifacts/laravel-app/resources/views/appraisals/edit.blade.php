<x-app-layout title="{{ Auth::id() === $appraisal->employee_id ? 'Self Review' : 'Manager Review' }}">
    <x-slot name="subtitle">{{ $appraisal->employee->name }} — {{ $appraisal->cycle->name ?? '' }}</x-slot>

    @php
        $isSelf = Auth::id() === $appraisal->employee_id;
        $isManager = Auth::id() === $appraisal->reviewer_id || Auth::user()->isAdmin();
    @endphp

    <form method="POST" action="{{ route('appraisals.update', $appraisal) }}">
        @csrf @method('PUT')

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="lg:col-span-2 space-y-6">

                {{-- Competency Scores --}}
                @if($appraisal->scores->isNotEmpty())
                <div class="bg-white rounded-xl border border-gray-200">
                    <div class="px-5 py-4 border-b border-gray-100">
                        <h2 class="font-semibold text-gray-900">Competency Ratings</h2>
                        <p class="text-xs text-gray-500 mt-0.5">Rate each competency from 1 (Unsatisfactory) to {{ $criteria->first()?->max_score ?? 5 }} (Outstanding)</p>
                    </div>
                    <div class="divide-y divide-gray-100">
                        @foreach($appraisal->scores as $score)
                        <div class="px-5 py-4">
                            <div class="flex items-center justify-between mb-2">
                                <div>
                                    <p class="font-medium text-gray-900 text-sm">{{ $score->criteria->name }}</p>
                                    <p class="text-xs text-gray-500">{{ $score->criteria->category }} · Weight: {{ $score->criteria->weight }}%</p>
                                </div>
                            </div>
                            @if($isSelf)
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-xs font-medium text-gray-600 mb-1">Your Score (1–{{ $score->criteria->max_score }})</label>
                                    <input type="number" name="self_scores[{{ $score->id }}][score]" value="{{ old("self_scores.{$score->id}.score", $score->self_score) }}" min="1" max="{{ $score->criteria->max_score }}" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500">
                                </div>
                                <div>
                                    <label class="block text-xs font-medium text-gray-600 mb-1">Comment</label>
                                    <input type="text" name="self_scores[{{ $score->id }}][comment]" value="{{ old("self_scores.{$score->id}.comment", $score->self_comment) }}" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500" placeholder="Optional comment">
                                </div>
                            </div>
                            @endif
                            @if($isManager && !$isSelf)
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-xs font-medium text-gray-600 mb-1">Self Score</label>
                                    <div class="flex items-center gap-2">
                                        <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-semibold text-sm">{{ $score->self_score ?? '—' }}</span>
                                        <span class="text-xs text-gray-500">{{ $score->self_comment }}</span>
                                    </div>
                                </div>
                                <div>
                                    <label class="block text-xs font-medium text-gray-600 mb-1">Manager Score (1–{{ $score->criteria->max_score }})</label>
                                    <input type="number" name="manager_scores[{{ $score->id }}][score]" value="{{ old("manager_scores.{$score->id}.score", $score->manager_score) }}" min="1" max="{{ $score->criteria->max_score }}" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500">
                                    <input type="text" name="manager_scores[{{ $score->id }}][comment]" value="{{ old("manager_scores.{$score->id}.comment", $score->manager_comment) }}" class="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500" placeholder="Comment">
                                </div>
                            </div>
                            @endif
                        </div>
                        @endforeach
                    </div>
                </div>
                @endif

                {{-- Goals --}}
                <div class="bg-white rounded-xl border border-gray-200">
                    <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                        <h2 class="font-semibold text-gray-900">Goals</h2>
                    </div>
                    @if($appraisal->goals->isNotEmpty())
                    <div class="divide-y divide-gray-100">
                        @foreach($appraisal->goals as $goal)
                        <div class="px-5 py-4">
                            <div class="flex items-start justify-between">
                                <div>
                                    <p class="font-medium text-gray-900 text-sm">{{ $goal->title }}</p>
                                    @if($goal->description)<p class="text-xs text-gray-500 mt-0.5">{{ $goal->description }}</p>@endif
                                </div>
                                @if($isSelf)
                                <form method="POST" action="{{ route('goals.destroy', $goal) }}" onsubmit="return confirm('Remove goal?')">
                                    @csrf @method('DELETE')
                                    <button type="submit" class="text-red-400 hover:text-red-600 text-xs">Remove</button>
                                </form>
                                @endif
                            </div>
                            @if($isSelf)
                            <div class="grid grid-cols-2 gap-4 mt-2">
                                <div>
                                    <label class="block text-xs font-medium text-gray-600 mb-1">Achievement %</label>
                                    <input type="number" name="goal_self[{{ $goal->id }}][achievement]" value="{{ old("goal_self.{$goal->id}.achievement", $goal->self_achievement) }}" min="0" max="100" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500">
                                </div>
                                <div>
                                    <label class="block text-xs font-medium text-gray-600 mb-1">Status</label>
                                    <select name="goal_self[{{ $goal->id }}][status]" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500">
                                        @foreach(['not_started', 'in_progress', 'completed', 'cancelled'] as $s)
                                            <option value="{{ $s }}" @selected($goal->status === $s)>{{ ucfirst(str_replace('_', ' ', $s)) }}</option>
                                        @endforeach
                                    </select>
                                </div>
                                <div class="col-span-2">
                                    <label class="block text-xs font-medium text-gray-600 mb-1">Comment</label>
                                    <input type="text" name="goal_self[{{ $goal->id }}][comment]" value="{{ old("goal_self.{$goal->id}.comment", $goal->self_comment) }}" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500">
                                </div>
                            </div>
                            @elseif($isManager)
                            <div class="grid grid-cols-2 gap-4 mt-2">
                                <div>
                                    <p class="text-xs text-gray-500">Self: <strong class="text-gray-900">{{ $goal->self_achievement ?? '—' }}%</strong></p>
                                </div>
                                <div>
                                    <label class="block text-xs font-medium text-gray-600 mb-1">Manager Achievement %</label>
                                    <input type="number" name="goal_manager[{{ $goal->id }}][achievement]" value="{{ old("goal_manager.{$goal->id}.achievement", $goal->manager_achievement) }}" min="0" max="100" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                                    <input type="text" name="goal_manager[{{ $goal->id }}][comment]" value="{{ old("goal_manager.{$goal->id}.comment", $goal->manager_comment) }}" class="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Comment">
                                </div>
                            </div>
                            @endif
                        </div>
                        @endforeach
                    </div>
                    @else
                    <div class="px-5 py-4 text-sm text-gray-400">No goals added yet.</div>
                    @endif

                    {{-- Add Goal (self only) --}}
                    @if($isSelf)
                    <div class="px-5 py-4 border-t border-gray-100 bg-gray-50">
                        <p class="text-sm font-medium text-gray-700 mb-3">Add a Goal</p>
                        <div class="grid grid-cols-2 gap-3">
                            <input type="text" id="goal_title" class="col-span-2 border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Goal title">
                            <input type="number" id="goal_weight" class="border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Weight %" min="1" max="100" value="10">
                            <input type="date" id="goal_date" class="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                            <textarea id="goal_desc" class="col-span-2 border border-gray-300 rounded-lg px-3 py-2 text-sm" rows="2" placeholder="Description (optional)"></textarea>
                        </div>
                        <form method="POST" action="{{ route('goals.store', $appraisal) }}" id="goalForm" class="mt-2">
                            @csrf
                            <input type="hidden" name="title" id="hTitle">
                            <input type="hidden" name="weight" id="hWeight">
                            <input type="hidden" name="target_date" id="hDate">
                            <input type="hidden" name="description" id="hDesc">
                            <button type="button" onclick="submitGoal()" class="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium px-4 py-2 rounded-lg transition">Add Goal</button>
                        </form>
                        <script>
                            function submitGoal() {
                                document.getElementById('hTitle').value = document.getElementById('goal_title').value;
                                document.getElementById('hWeight').value = document.getElementById('goal_weight').value;
                                document.getElementById('hDate').value = document.getElementById('goal_date').value;
                                document.getElementById('hDesc').value = document.getElementById('goal_desc').value;
                                document.getElementById('goalForm').submit();
                            }
                        </script>
                    </div>
                    @endif
                </div>

                {{-- Comments --}}
                <div class="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
                    @if($isSelf)
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Self Comments</label>
                        <textarea name="self_comments" rows="4" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500" placeholder="Overall self-assessment comments...">{{ old('self_comments', $appraisal->self_comments) }}</textarea>
                    </div>
                    @endif
                    @if($isManager && !$isSelf)
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Manager Comments</label>
                        <textarea name="manager_comments" rows="4" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500">{{ old('manager_comments', $appraisal->manager_comments) }}</textarea>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Overall Comments</label>
                        <textarea name="overall_comments" rows="3" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500">{{ old('overall_comments', $appraisal->overall_comments) }}</textarea>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select name="status" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500">
                            <option value="manager_review" @selected($appraisal->status === 'manager_review')>In Review</option>
                            <option value="completed" @selected($appraisal->status === 'completed')>Mark Completed</option>
                        </select>
                    </div>
                    @endif
                </div>
            </div>

            {{-- Sidebar --}}
            <div class="space-y-4">
                <div class="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
                    <h3 class="text-sm font-semibold text-gray-900">Actions</h3>
                    @if($isSelf)
                    <button type="submit" name="submit" value="0" class="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg transition">Save Draft</button>
                    <button type="submit" name="submit" value="1" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition">Submit for Manager Review</button>
                    @else
                    <button type="submit" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition">Save Review</button>
                    @endif
                    <a href="{{ route('appraisals.show', $appraisal) }}" class="block text-center text-sm text-gray-500 hover:underline">Cancel</a>
                </div>

                <div class="bg-white rounded-xl border border-gray-200 p-5 text-sm space-y-2">
                    <p class="font-medium text-gray-900">{{ $appraisal->employee->name }}</p>
                    <p class="text-gray-500">{{ $appraisal->employee->position }}</p>
                    <p class="text-gray-500">{{ $appraisal->employee->department }}</p>
                    <div class="pt-2 border-t border-gray-100">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {{ $appraisal->status_badge }}">
                            {{ $appraisal->status_label }}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </form>
</x-app-layout>
