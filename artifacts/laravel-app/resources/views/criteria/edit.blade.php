<x-app-layout title="Edit Criteria">
    <div class="max-w-2xl">
        <div class="bg-white rounded-xl border border-gray-200 p-6">
            <form method="POST" action="{{ route('criteria.update', $criterion) }}" class="space-y-5">
                @csrf @method('PUT')
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input type="text" name="name" value="{{ old('name', $criterion->name) }}" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" required>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <input type="text" name="category" value="{{ old('category', $criterion->category) }}" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" required>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea name="description" rows="3" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">{{ old('description', $criterion->description) }}</textarea>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Max Score</label>
                        <input type="number" name="max_score" value="{{ old('max_score', $criterion->max_score) }}" min="1" max="10" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" required>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Weight (%)</label>
                        <input type="number" name="weight" value="{{ old('weight', $criterion->weight) }}" min="1" max="100" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" required>
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <input type="checkbox" name="is_active" id="is_active" value="1" class="rounded border-gray-300 text-indigo-600" @checked(old('is_active', $criterion->is_active))>
                    <label for="is_active" class="text-sm font-medium text-gray-700">Active</label>
                </div>
                <div class="flex gap-3 pt-2">
                    <button type="submit" class="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition">Save Changes</button>
                    <a href="{{ route('criteria.index') }}" class="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium px-5 py-2 rounded-lg transition">Cancel</a>
                </div>
            </form>
        </div>
    </div>
</x-app-layout>
