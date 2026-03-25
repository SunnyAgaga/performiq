<x-app-layout title="Rating Criteria">
    <x-slot name="actions">
        <a href="{{ route('criteria.create') }}" class="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            New Criteria
        </a>
    </x-slot>

    @foreach($categories as $category)
    <div class="mb-6">
        <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">{{ $category }}</h3>
        <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table class="w-full text-sm">
                <thead>
                    <tr class="bg-gray-50 text-left">
                        <th class="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Name</th>
                        <th class="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Description</th>
                        <th class="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Max Score</th>
                        <th class="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Weight</th>
                        <th class="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                        <th class="px-5 py-3 text-xs font-semibold text-gray-500 uppercase"></th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    @foreach($criteria->where('category', $category) as $criterion)
                    <tr class="hover:bg-gray-50">
                        <td class="px-5 py-3 font-medium text-gray-900">{{ $criterion->name }}</td>
                        <td class="px-5 py-3 text-gray-500 max-w-xs truncate">{{ $criterion->description }}</td>
                        <td class="px-5 py-3 text-gray-600">{{ $criterion->max_score }}</td>
                        <td class="px-5 py-3 text-gray-600">{{ $criterion->weight }}%</td>
                        <td class="px-5 py-3">
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {{ $criterion->is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800' }}">
                                {{ $criterion->is_active ? 'Active' : 'Inactive' }}
                            </span>
                        </td>
                        <td class="px-5 py-3 text-right">
                            <div class="flex items-center justify-end gap-3">
                                <a href="{{ route('criteria.edit', $criterion) }}" class="text-gray-600 hover:underline text-xs">Edit</a>
                                <form method="POST" action="{{ route('criteria.destroy', $criterion) }}" onsubmit="return confirm('Delete this criteria?')">
                                    @csrf @method('DELETE')
                                    <button type="submit" class="text-red-500 hover:underline text-xs">Delete</button>
                                </form>
                            </div>
                        </td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    </div>
    @endforeach

    @if($criteria->isEmpty())
    <div class="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400">No criteria defined yet.</div>
    @endif
</x-app-layout>
