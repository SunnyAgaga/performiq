<?php if (isset($component)) { $__componentOriginal9ac128a9029c0e4701924bd2d73d7f54 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal9ac128a9029c0e4701924bd2d73d7f54 = $attributes; } ?>
<?php $component = App\View\Components\AppLayout::resolve([] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('app-layout'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\App\View\Components\AppLayout::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['title' => 'Dashboard','subtitle' => 'Welcome back, '.e(Auth::user()->name).'']); ?>
    <?php if($activeCycle && !$myAppraisal): ?>
    <div class="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
        <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        <p class="text-sm text-blue-800">The active cycle <strong><?php echo e($activeCycle->name); ?></strong> is open. Your appraisal will be created by your manager or HR.</p>
    </div>
    <?php endif; ?>

    <?php if($myAppraisal): ?>
    <div class="mb-6 bg-white rounded-xl border border-gray-200 p-5">
        <div class="flex items-center justify-between mb-3">
            <h2 class="font-semibold text-gray-900">Current Appraisal — <?php echo e($activeCycle->name); ?></h2>
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium <?php echo e($myAppraisal->status_badge); ?>">
                <?php echo e($myAppraisal->status_label); ?>

            </span>
        </div>

        <?php if($myAppraisal->status === 'self_review' || $myAppraisal->status === 'pending'): ?>
        <p class="text-sm text-gray-600 mb-4">It's time to complete your self-assessment for this cycle.</p>
        <a href="<?php echo e(route('appraisals.edit', $myAppraisal)); ?>" class="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
            Start Self Review →
        </a>
        <?php elseif($myAppraisal->status === 'manager_review'): ?>
        <p class="text-sm text-gray-600">Your self-review has been submitted. Awaiting manager review.</p>
        <?php elseif($myAppraisal->status === 'completed'): ?>
        <div class="grid grid-cols-3 gap-4 mt-3">
            <div class="text-center">
                <p class="text-xs text-gray-500">Self Rating</p>
                <p class="text-xl font-bold text-gray-900"><?php echo e(number_format($myAppraisal->self_rating ?? 0, 1)); ?></p>
            </div>
            <div class="text-center">
                <p class="text-xs text-gray-500">Manager Rating</p>
                <p class="text-xl font-bold text-gray-900"><?php echo e(number_format($myAppraisal->manager_rating ?? 0, 1)); ?></p>
            </div>
            <div class="text-center">
                <p class="text-xs text-gray-500">Final Rating</p>
                <p class="text-xl font-bold text-indigo-600"><?php echo e(number_format($myAppraisal->final_rating ?? 0, 1)); ?></p>
            </div>
        </div>
        <a href="<?php echo e(route('appraisals.show', $myAppraisal)); ?>" class="inline-block mt-4 text-sm text-indigo-600 hover:underline font-medium">View full appraisal →</a>
        <?php endif; ?>
    </div>
    <?php endif; ?>

    <div class="bg-white rounded-xl border border-gray-200">
        <div class="px-5 py-4 border-b border-gray-100">
            <h2 class="font-semibold text-gray-900">My Appraisal History</h2>
        </div>
        <div class="overflow-x-auto">
            <table class="w-full text-sm">
                <thead>
                    <tr class="bg-gray-50 text-left">
                        <th class="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Cycle</th>
                        <th class="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                        <th class="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Final Rating</th>
                        <th class="px-5 py-3 text-xs font-semibold text-gray-500 uppercase"></th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    <?php $__empty_1 = true; $__currentLoopData = $myAppraisals; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $appraisal): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); $__empty_1 = false; ?>
                    <tr class="hover:bg-gray-50">
                        <td class="px-5 py-3 font-medium text-gray-900"><?php echo e($appraisal->cycle->name ?? '—'); ?></td>
                        <td class="px-5 py-3">
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium <?php echo e($appraisal->status_badge); ?>">
                                <?php echo e($appraisal->status_label); ?>

                            </span>
                        </td>
                        <td class="px-5 py-3 text-gray-600"><?php echo e($appraisal->final_rating ? number_format($appraisal->final_rating, 1) . ' / 5' : '—'); ?></td>
                        <td class="px-5 py-3 text-right">
                            <a href="<?php echo e(route('appraisals.show', $appraisal)); ?>" class="text-indigo-600 hover:underline text-xs font-medium">View</a>
                        </td>
                    </tr>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); if ($__empty_1): ?>
                    <tr><td colspan="4" class="px-5 py-8 text-center text-gray-400">No appraisals yet.</td></tr>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>
    </div>
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
<?php /**PATH /home/runner/workspace/artifacts/laravel-app/resources/views/dashboard/employee.blade.php ENDPATH**/ ?>