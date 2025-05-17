<script lang="ts">
	import Field, { type IField } from '$lib/components/field.svelte';
	import Loader from '$lib/components/loader.svelte';
	import { addError } from '$lib/stores/notices';
	import { fetchPrices } from '$lib/utils/apis';

	let form: HTMLFormElement;
	let category: Record<string, any> = {};
	let loading = false;

	let priceInfo: Record<string, App.IPricesInfo> = {};

	const categoryOptions = [
		{ label: 'Pickup', value: 'Pickup' },
		{ label: 'Dry Clean', value: 'Dry Clean' },
		{ label: 'Laundry', value: 'Laundry' },
	];

	const fields: IField[] = [
		{
			key: 'Type',
			definition: {
				Edit: true,
				Label: 'Select Category',
				Type: 'select',
				Options: categoryOptions,
				Required: true,
			},
		},
	];

	$: headers = ['#', 'Category', 'Price'];

	async function submitForm() {
		try {
			loading = true;
			if (!category.Type) return;
			const resp = await fetchPrices(category.Type);
			if (!resp?.pricesInfo) return addError('No Pirces exists for this category.');
			priceInfo = resp.pricesInfo;
		} finally {
			loading = false;
		}
	}

	$: disabled = !form || !form.checkValidity() || !category;
</script>

<h1 class="fw-bold fs-5">Prices</h1>

<main class="mt-3">
	<form method="post" class="position-relative d-flex flex-column flex-grow-1 justify-content-between gap-2" bind:this={form} on:submit|preventDefault={submitForm}>
		<div class="narrow-form">
			{#each fields as { key, definition }}
				<div class="mb-3" data-field={key}>
					<Field {key} {definition} bind:value={category[key]} />
				</div>
			{/each}
		</div>

		<button class="d-none">Needed for ENTER to submit</button>
		<button on:click={() => form.checkValidity()} type="submit" class="btn btn-primary text-uppercase mb-3" {disabled}> Check Prices </button>
	</form>
</main>

{#if loading}
	<Loader />
{:else if priceInfo && Object.values(priceInfo).length}
	<table class="table table-bordered">
		<thead>
			<tr>
				{#each headers as title}
					<th>{title}</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each Object.values(priceInfo) as p, index}
				<tr>
					<th scope="row">{index + 1}</th>
					<td>{p.Category ?? category.Type}</td>
					<td>₹{p.Price}</td>
				</tr>
			{/each}
		</tbody>
	</table>
{/if}
