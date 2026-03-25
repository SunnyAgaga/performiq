<x-app-layout title="Appraisal Cycles">
    <x-slot name="actions">
        <a href="{{ route('cycles.create') }}" class="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            New Cycle
        </a>
    </x-slot>

    <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table class="w-full text-sm">
            <thead>
                <tr class="bg-gray-50 text-left">
                    <th class="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Name</th>
                    <th class="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Year</th>
                    <th class="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Period</th>
                    <th class="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th class="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Appraisals</th>
                    <th class="px-5 py-3 text-xs font-semibold text-gray-500 uppercase"></th>
                </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
                @forelse($cycles as $cycle)
                <tr class="hover:bg-gray-50">
                    <td class="px-5 py-3 font-medium text-gray-900">{{ $cycle->name }}</td>
                    <td class="px-5 py-3 text-gray-600">{{ $cycle->year }}</td>
                    <td class="px-5 py-3 text-gray-600">{{ $cycle->start_date->format('M d, Y') }} – {{ $cycle->end_date->format('M d, Y') }}</td>
                    <td class="px-5 py-3">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {{ $cycle->status_badge }}">
                            {{ ucfirst($cycle->status) }}
                        </span>
                    </td>
                    <td class="px-5 py-3 text-gray-600">{{ $cycle->appraisals_count }}</td>
                    <td class="px-5 py-3 text-right">
                        <div class="flex items-center justify-end gap-3">
                            <a href="{{ route('cycles.show', $cycle) }}" class="text-indigo-600 hover:underline text-xs">View</a>
                            <a href="{{ route('cycles.edit', $cycle) }}" class="text-gray-600 hover:underline text-xs">Edit</a>
                            <form method="POST" action="{{ route('cycles.destroy', $cycle) }}" onsubmit="return confirm('Delete this cycle?')">
                                @csrf @method('DELETE')
                                <button type="submit" class="text-red-500 hover:underline text-xs">Delete</button>
                            </form>
                        </div>
                    </td>
                </tr>
                @empty
                <tr><td colspan="6" class="px-5 py-8 text-center text-gray-400">No appraisal cycles yet.</td></tr>
                @endforelse
            </tbody>
        </table>
    </div>
</x-app-layout>
