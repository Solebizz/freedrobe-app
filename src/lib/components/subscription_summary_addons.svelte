<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { IField } from './field.svelte';
	import Field from './field.svelte';

	export let plans: Record<string, App.IProtectionPlanInfo>;
	export let selectProtectionPlan: (id: string) => {};

	let selectedPlan: Record<string, any> = {};

	let form: HTMLFormElement;

	const planOptions = Object.values(plans).map((p) => {
		return { label: p.Title, value: p.ID, description: p.Description };
	});

	const fields: IField[] = [
		{
			key: 'Plan',
			definition: {
				Label: 'Select plan',
				Required: true,
				Edit: true,
				Type: 'radio',
				Options: planOptions,
			},
		},
	];

	const dispatch = createEventDispatcher();

	function submitForm() {
		selectProtectionPlan(selectedPlan.Plan);
		dispatch('close');
	}

	$: disabled = !form || !form.checkValidity() || !selectedPlan;
</script>

<p class="fs-5 fw-bold mb-1">Protection Plans</p>
<main class="mt-3">
	<form method="post" class="position-relative d-flex flex-column flex-grow-1 justify-content-between gap-2" bind:this={form} on:submit|preventDefault={submitForm}>
		<div class="narrow-form">
			{#each fields as { key, definition }}
				<div class="mb-3" data-field={key}>
					<Field {key} {definition} bind:value={selectedPlan[key]} />
				</div>
			{/each}
		</div>

		<button class="d-none">Needed for ENTER to submit</button>
		<button on:click={() => form.checkValidity()} {disabled} type="submit" class="btn btn-primary text-uppercase mb-3"> continue </button>
	</form>
</main>
