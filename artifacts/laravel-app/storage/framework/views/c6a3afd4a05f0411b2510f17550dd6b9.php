<?php if (isset($component)) { $__componentOriginal9ac128a9029c0e4701924bd2d73d7f54 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal9ac128a9029c0e4701924bd2d73d7f54 = $attributes; } ?>
<?php $component = App\View\Components\AppLayout::resolve([] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('app-layout'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\App\View\Components\AppLayout::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['title' => 'Appraisals']); ?>
    <?php if (app(\Illuminate\Contracts\Auth\Access\Gate::class)->check('admin')): ?>
     <?php $__env->slot('actions', null, []); ?> 
        <a href="<?php echo e(route('appraisals.create')); ?>" class="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            New Appraisal
        </a>
     <?php $__env->endSlot(); ?>
    <?php endif; ?>

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
                <?php $__empty_1 = true; $__currentLoopData = $appraisals; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $appraisal): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); $__empty_1 = false; ?>
                <tr class="hover:bg-gray-50">
                    <td class="px-5 py-3">
                        <div class="font-medium text-gray-900"><?php echo e($appraisal->employee->name); ?></div>
                        <div class="text-gray-500 text-xs"><?php echo e($appraisal->employee->position); ?></div>
                    </td>
                    <td class="px-5 py-3 text-gray-600"><?php echo e($appraisal->cycle->name ?? '—'); ?></td>
                    <td class="px-5 py-3 text-gray-600"><?php echo e($appraisal->reviewer?->name ?? '—'); ?></td>
                    <td class="px-5 py-3">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium <?php echo e($appraisal->status_badge); ?>">
                            <?php echo e($appraisal->status_label); ?>

                        </span>
                    </td>
                    <td class="px-5 py-3 text-gray-600">
                        <?php echo e($appraisal->final_rating ? number_format($appraisal->final_rating, 1) . ' / 5' : '—'); ?>

                    </td>
                    <td class="px-5 py-3 text-right">
                        <div class="flex items-center justify-end gap-3">
                            <a href="<?php echo e(route('appraisals.show', $appraisal)); ?>" class="text-indigo-600 hover:underline text-xs font-medium">View</a>
                            <?php if($appraisal->status !== 'completed'): ?>
                            <a href="<?php echo e(route('appraisals.edit', $appraisal)); ?>" class="text-gray-600 hover:underline text-xs">Edit</a>
                            <?php endif; ?>
                        </div>
                    </td>
                </tr>
                <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); if ($__empty_1): ?>
                <tr><td colspan="6" class="px-5 py-8 text-center text-gray-400">No appraisals found.</td></tr>
                <?php endif; ?>
            </tbody>
        </table>
    </div>

    <div class="mt-4"><?php echo e($appraisals->links()); ?></div>
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
<?php /**PATH /home/runner/workspace/artifacts/laravel-app/resources/views/appraisals/index.blade.php ENDPATH**/ ?>