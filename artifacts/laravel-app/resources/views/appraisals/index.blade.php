<x-app-layout title="Appraisals">
    @can('admin')
    <x-slot name="actions">
        <a href="{{ route('appraisals.create') }}" class="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            New Appraisal
        </a>
    </x-slot>
    @endcan

    <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table class="w-full text-sm">
            <thead>
                <tr class="bg-gray-50 text-left">
                    <th class="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Employee</th>
                    <th class="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Cycle</th>
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
                        <div class="text-gray-500 text-xs">{{ $appraisal->employee->position }}</div>
                    </td>
                    <td class="px-5 py-3 text-gray-600">{{ $appraisal->cycle->name ?? '—' }}</td>
                    <td class="px-5 py-3 text-gray-600">{{ $appraisal->reviewer?->name ?? '—' }}</td>
                    <td class="px-5 py-3">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {{ $appraisal->status_badge }}">
                            {{ $appraisal->status_label }}
                        </span>
                    </td>
                    <td class="px-5 py-3 text-gray-600">
                        {{ $appraisal->final_rating ? number_format($appraisal->final_rating, 1) . ' / 5' : '—' }}
                    </td>
                    <td class="px-5 py-3 text-right">
                        <div class="flex items-center justify-end gap-3">
                            <a href="{{ route('appraisals.show', $appraisal) }}" class="text-indigo-600 hover:underline text-xs font-medium">View</a>
                            @if($appraisal->status !== 'completed')
                            <a href="{{ route('appraisals.edit', $appraisal) }}" class="text-gray-600 hover:underline text-xs">Edit</a>
                            @endif
                        </div>
                    </td>
                </tr>
                @empty
                <tr><td colspan="6" class="px-5 py-8 text-center text-gray-400">No appraisals found.</td></tr>
                @endforelse
            </tbody>
        </table>
    </div>

    <div class="mt-4">{{ $appraisals->links() }}</div>
</x-app-layout>
