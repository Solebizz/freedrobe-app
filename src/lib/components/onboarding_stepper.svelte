<script lang="ts">
	export let currentStep: number = 1;
	export let completedSteps: number[] = [];

	const steps = [
		{ number: 1, label: 'Profile' },
		{ number: 2, label: 'Subscription' },
		{ number: 3, label: 'Pickup' },
	];

	function isCompleted(stepNumber: number): boolean {
		return completedSteps.includes(stepNumber);
	}

	function isActive(stepNumber: number): boolean {
		return currentStep === stepNumber;
	}
</script>

<div class="d-flex align-items-center justify-content-center py-4">
	{#each steps as step, index}
		<div class="d-flex align-items-center">
			<!-- Step Circle -->
			<div class="position-relative">
				{#if isCompleted(step.number)}
					<div class="rounded-circle bg-success d-flex align-items-center justify-content-center text-white" style="width: 40px; height: 40px;">
						<i class="bi bi-check-lg fs-5"></i>
					</div>
				{:else if isActive(step.number)}
					<div class="rounded-circle bg-info d-flex align-items-center justify-content-center text-white fw-bold" style="width: 40px; height: 40px;">
						{step.number}
					</div>
				{:else}
					<div class="rounded-circle bg-secondary bg-opacity-25 d-flex align-items-center justify-content-center text-secondary fw-bold" style="width: 40px; height: 40px;">
						{step.number}
					</div>
				{/if}
			</div>

			<!-- Connector Line -->
			{#if index < steps.length - 1}
				<div
					class="mx-2"
					class:bg-success={isCompleted(step.number) && isCompleted(steps[index + 1].number)}
					class:bg-info={isCompleted(step.number) && isActive(steps[index + 1].number)}
					class:bg-secondary={!isCompleted(step.number)}
					class:bg-opacity-25={!isCompleted(step.number)}
					style="width: 60px; height: 4px;">
				</div>
			{/if}
		</div>
	{/each}
</div>
