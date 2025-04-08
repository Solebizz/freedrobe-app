<script lang="ts">
	import Field, { type FieldDefinition } from '$lib/components/field.svelte';
	interface Field {
		key: string;
		definition: FieldDefinition;
	}

	let form: HTMLFormElement;
	let profile = {};

	let stateOptions = [{ label: 'Uttarpradesh', value: 'UP' }];

	let areaOptions = [
		{ label: 'Sector 120', value: '120' },
		{ label: 'Sector 25', value: '28' },
		{ label: 'Sector 125', value: '125' },
	];

	let cityOptions = [
		{ label: 'Noida', value: 'noida' },
		{ label: 'Ghaziabad', value: 'ghaziabad' },
	];

	let fields: Field[] = [
		{
			key: 'Name',
			definition: {
				Edit: true,
				Label: 'Name',
				Type: 'text',
				Required: true,
			},
		},
		{
			key: 'AddressLine1',
			definition: {
				Edit: true,
				Label: 'Address Line 1',
				Type: 'text',
				Required: true,
			},
		},
		{
			key: 'AddressLine2',
			definition: {
				Edit: true,
				Label: 'Address Line 2',
				Type: 'text',
				Required: false,
			},
		},
		{
			key: 'Area',
			definition: {
				Edit: true,
				Label: 'Area',
				Type: 'select',
				Required: true,
				Options: areaOptions,
				Default: '120',
			},
		},
		{
			key: 'City',
			definition: {
				Edit: true,
				Label: 'City',
				Type: 'select',
				Required: true,
				Options: cityOptions,
				Default: 'noida',
			},
		},
		{
			key: 'State',
			definition: {
				Edit: true,
				Label: 'State',
				Type: 'select',
				Required: true,
				Options: stateOptions,
				Default: 'UP',
			},
		},
	];

	$: disabled = !form || !form.checkValidity() || !profile;

	function checkSubmit() {
		return true;
	}
</script>

<h1 class="fw-bold">My Profile</h1>

<main class="mt-3">
	<form method="post" class="position-relative d-flex flex-column flex-grow-1 justify-content-between gap-2" bind:this={form} on:submit={checkSubmit}>
		<div class="narrow-form">
			{#each fields as { key, definition }}
				<div class="mb-3" data-field={key}>
					<Field {key} {definition} bind:value={profile[key]} />
				</div>
			{/each}
		</div>

		<button class="d-none">Needed for ENTER to submit</button>
		<button on:click={() => checkSubmit() && form.checkValidity() && form.submit()} type="submit" class="btn btn-primary text-uppercase" {disabled} on:click={(e) => form.submit()}> Update </button>
	</form>
</main>
