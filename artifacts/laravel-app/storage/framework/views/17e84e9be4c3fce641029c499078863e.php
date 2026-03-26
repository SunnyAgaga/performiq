<?php if (isset($component)) { $__componentOriginal9ac128a9029c0e4701924bd2d73d7f54 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal9ac128a9029c0e4701924bd2d73d7f54 = $attributes; } ?>
<?php $component = App\View\Components\AppLayout::resolve([] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('app-layout'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\App\View\Components\AppLayout::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['title' => 'Rating Criteria']); ?>
     <?php $__env->slot('actions', null, []); ?> 
        <a href="<?php echo e(route('criteria.create')); ?>" class="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            New Criteria
        </a>
     <?php $__env->endSlot(); ?>

    <?php $__currentLoopData = $categories; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $category): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
    <div class="mb-6">
        <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3"><?php echo e($category); ?></h3>
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
                    <?php $__currentLoopData = $criteria->where('category', $category); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $criterion): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                    <tr class="hover:bg-gray-50">
                        <td class="px-5 py-3 font-medium text-gray-900"><?php echo e($criterion->name); ?></td>
                        <td class="px-5 py-3 text-gray-500 max-w-xs truncate"><?php echo e($criterion->description); ?></td>
                        <td class="px-5 py-3 text-gray-600"><?php echo e($criterion->max_score); ?></td>
                        <td class="px-5 py-3 text-gray-600"><?php echo e($criterion->weight); ?>%</td>
                        <td class="px-5 py-3">
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium <?php echo e($criterion->is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'); ?>">
                                <?php echo e($criterion->is_active ? 'Active' : 'Inactive'); ?>

                            </span>
                        </td>
                        <td class="px-5 py-3 text-right">
                            <div class="flex items-center justify-end gap-3">
                                <a href="<?php echo e(route('criteria.edit', $criterion)); ?>" class="text-gray-600 hover:underline text-xs">Edit</a>
                                <form method="POST" action="<?php echo e(route('criteria.destroy', $criterion)); ?>" onsubmit="return confirm('Delete this criteria?')">
                                    <?php echo csrf_field(); ?> <?php echo method_field('DELETE'); ?>
                                    <button type="submit" class="text-red-500 hover:underline text-xs">Delete</button>
                                </form>
                            </div>
                        </td>
                    </tr>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                </tbody>
            </table>
        </div>
    </div>
    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>

    <?php if($criteria->isEmpty()): ?>
    <div class="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400">No criteria defined yet.</div>
    <?php endif; ?>
 <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal9ac128a9029c0e4701924bd2d73d7f54)): ?>
<?php $attributes = $__attributesOriginal9ac128a9029c0e4701924bd2d73d7f54; ?>
<?php unset($__attributesOriginal9ac128a9029c0e4701924bd2d73d7f54); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal9ac128a9029c0e4701924bd2d73d7f54)): ?>
<?php $component = $__componentOriginal9ac128a9029c0e4701924bd2d73d7f54; ?>
<?php unset($__componentOriginal9ac128a9029c0e4701924bd2d73d7f54); ?>
<?php endif; ?>
<?php /**PATH /home/runner/workspace/artifacts/laravel-app/resources/views/criteria/index.blade.php ENDPATH**/ ?>