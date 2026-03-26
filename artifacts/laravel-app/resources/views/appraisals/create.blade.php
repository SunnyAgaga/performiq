<x-app-layout title="New Appraisal">
    <div class="max-w-2xl">
        <div class="bg-white rounded-xl border border-gray-200 p-6">
            <form method="POST" action="{{ route('appraisals.store') }}" class="space-y-5">
                @csrf
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Employee</label>
                    <select name="employee_id" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" required>
                        <option value="">Select employee...</option>
                        @foreach($employees as $emp)
                            <option value="{{ $emp->id }}" @selected(old('employee_id') == $emp->id)>
                                {{ $emp->name }} ({{ $emp->department }})
                            </option>
                        @endforeach
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Appraisal Cycle</label>
                    <select name="cycle_id" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" required>
                        <option value="">Select cycle...</option>
                        @foreach($cycles as $cycle)
                            <option value="{{ $cycle->id }}" @selected(old('cycle_id') == $cycle->id)>{{ $cycle->name }}</option>
                        @endforeach
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Reviewer (optional)</label>
                    <select name="reviewer_id" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                        <option value="">Assign later...</option>
                        @foreach(App\Models\User::whereIn('role', ['manager','admin'])->orderBy('name')->get() as $mgr)
                            <option value="{{ $mgr->id }}" @selected(old('reviewer_id') == $mgr->id)>{{ $mgr->name }}</option>
                        @endforeach
                    </select>
                </div>
                <div class="flex gap-3 pt-2">
                    <button type="submit" class="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition">Create Appraisal</button>
                    <a href="{{ route('appraisals.index') }}" class="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium px-5 py-2 rounded-lg transition">Cancel</a>
                </div>
            </form>
        </div>
    </div>
</x-app-layout>
