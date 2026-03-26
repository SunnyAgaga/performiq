<x-app-layout title="{{ $cycle->name }}">
    <x-slot name="actions">
        <a href="{{ route('cycles.edit', $cycle) }}" class="inline-flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg transition">Edit</a>
        <a href="{{ route('appraisals.create') }}" class="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition">New Appraisal</a>
    </x-slot>

    <div class="grid grid-cols-3 gap-4 mb-6">
        <div class="bg-white rounded-xl border border-gray-200 p-5">
            <p class="text-sm text-gray-500">Period</p>
            <p class="text-sm font-semibold text-gray-900 mt-1">{{ $cycle->start_date->format('M d, Y') }} – {{ $cycle->end_date->format('M d, Y') }}</p>
        </div>
        <div class="bg-white rounded-xl border border-gray-200 p-5">
            <p class="text-sm text-gray-500">Status</p>
            <span class="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {{ $cycle->status_badge }}">{{ ucfirst($cycle->status) }}</span>
        </div>
        <div class="bg-white rounded-xl border border-gray-200 p-5">
            <p class="text-sm text-gray-500">Total Appraisals</p>
            <p class="text-2xl font-bold text-gray-900 mt-1">{{ $appraisals->count() }}</p>
        </div>
    </div>

    @if($cycle->description)
    <div class="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <p class="text-sm text-gray-600">{{ $cycle->description }}</p>
    </div>
    @endif

    <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div class="px-5 py-4 border-b border-gray-100">
            <h2 class="font-semibold text-gray-900">Appraisals in this Cycle</h2>
        </div>
        <table class="w-full text-sm">
            <thead>
                <tr class="bg-gray-50 text-left">
                    <th class="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Employee</th>
                    <th class="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Reviewer</th>
                    <th class="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th class="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Rating</th>
                    <th class="px-5 py-3 text-xs font-semibold text-gray-500 uppercase"></th>
                </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
                @forelse($appraisals as $appraisal)
                <tr class="hover:bg-gray-50">
                    <td class="px-5 py-3">
                        <div class="font-medium text-gray-900">{{ $appraisal->employee->name }}</div>
                        <div class="text-gray-500 text-xs">{{ $appraisal->employee->department }}</div>
                    </td>
                    <td class="px-5 py-3 text-gray-600">{{ $appraisal->reviewer?->name ?? '—' }}</td>
                    <td class="px-5 py-3">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {{ $appraisal->status_badge }}">
                            {{ $appraisal->status_label }}
                        </span>
                    </td>
                    <td class="px-5 py-3 text-gray-600">{{ $appraisal->final_rating ? number_format($appraisal->final_rating, 1) : '—' }}</td>
                    <td class="px-5 py-3 text-right">
                        <a href="{{ route('appraisals.show', $appraisal) }}" class="text-indigo-600 hover:underline text-xs font-medium">View</a>
                    </td>
                </tr>
                @empty
                <tr><td colspan="5" class="px-5 py-8 text-center text-gray-400">No appraisals in this cycle.</td></tr>
                @endforelse
            </tbody>
        </table>
    </div>
</x-app-layout>
