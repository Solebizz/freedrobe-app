<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { IField } from './field.svelte';
	import Field from './field.svelte';
	import { fetchCouponInfo } from '$lib/utils/apis';

	export let updateDiscountCoupon: (id: App.ICouopnInfo) => {};

	let obj: Record<string, any> = {};

	let form: HTMLFormElement;

	const fields: IField[] = [
		{
			key: 'Coupon',
			definition: {
				Label: 'Enter Coupon',
				Required: true,
				Edit: true,
				Type: 'text',
			},
		},
	];

	const dispatch = createEventDispatcher();

	async function submitForm() {
		if (!obj.Coupon) return;

		const resp = await fetchCouponInfo(obj.Coupon);
		if (!resp) {
			return;
		}

		updateDiscountCoupon(resp.discountInfo);
		dispatch('close');
	}

	$: disabled = !form || !form.checkValidity() || !obj;
</script>

<p class="fs-5 fw-bold mb-1">Apply Coupon</p>
<main class="mt-3">
	<form method="post" class="position-relative d-flex flex-column flex-grow-1 justify-content-between gap-2" bind:this={form} on:submit|preventDefault={submitForm}>
		<div class="narrow-form">
			{#each fields as { key, definition }}
				<div class="mb-3" data-field={key}>
					<Field {key} {definition} bind:value={obj[key]} />
				</div>
			{/each}
		</div>

		<button class="d-none">Needed for ENTER to submit</button>
		<button on:click={() => form.checkValidity()} {disabled} type="submit" class="btn btn-primary text-uppercase mb-3"> continue </button>
	</form>
</main>
