<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { IField } from './field.svelte';
	import Field from './field.svelte';

	export let index;
	export let article: Record<string, any> = {};
	export let updateArticleInfo: (info: Record<string, any>) => {};

	let form: HTMLFormElement;
	const dispatch = createEventDispatcher();

	let fields: IField[] = [
		{
			key: 'name',
			definition: {
				Required: true,
				Edit: true,
				Label: 'Enter Name',
				Type: 'text',
			},
		},
		{
			key: 'image',
			definition: {
				Edit: true,
				Label: 'Enter Image',
				Type: 'image',
			},
		},
		{
			key: 'category',
			definition: {
				Required: true,
				Edit: true,
				Label: 'Enter Category',
				Type: 'text',
			},
		},
		{
			key: 'shelfCode',
			definition: {
				Required: true,
				Edit: true,
				Label: 'Enter Shelf Code',
				Type: 'text',
			},
		},
		{
			key: 'bagCode',
			definition: {
				Required: true,
				Edit: true,
				Label: 'Enter Bag Code',
				Type: 'text',
			},
		},
	];

	function submitForm() {
		updateArticleInfo(article);
		dispatch('close');
	}

	$: disabled = !form || !form.checkValidity() || !article;
</script>

<h1 class="fw-bold mb-3 fs-5">
	Article #{index + 1}
</h1>
<form class="position-relative d-flex flex-column flex-grow-1 justify-content-between gap-1 mt-4" bind:this={form} on:submit|preventDefault={submitForm}>
	{#each fields as { key, definition }}
		<div data-field={key}>
			<Field {key} {definition} bind:value={article[key]} />
		</div>
	{/each}

	<button class="d-none">Needed for ENTER to submit</button>
	<button on:click={() => form.checkValidity()} type="submit" class="btn btn-primary text-uppercase" {disabled}>Add </button>
</form>
