<script lang="ts">
	import { goto } from '$app/navigation';
	import Field, { type IField } from '$lib/components/field.svelte';
	import Loader from '$lib/components/loader.svelte';
	import OrderDetails from '$lib/components/order_details.svelte';
	import { APP } from '$lib/stores/appMain';
	import { bottomSheetStore } from '$lib/stores/bottom_sheet';
	import { addError, addNotice } from '$lib/stores/notices';
	import { cofirmOrder, placeOrderAndFetchPrice } from '$lib/utils/apis';
	import type { SvelteComponent } from 'svelte';

	export let width = 200;
	export let border = 2;

	let form: HTMLFormElement;
	let order: Record<string, any> = {};
	let loading = false;

	$: itemsInBag = Array.isArray($APP.ArticlesInBag) && $APP.Articles ? $APP.ArticlesInBag.map((id) => $APP.Articles?.[id]).filter((item) => item !== undefined) : [];

	let fields: IField[] = [
		{
			key: 'Type',
			definition: {
				Edit: true,
				Label: 'Select Service Type',
				Type: 'radio',
				Required: true,
				Options: [
					{ label: 'Delivery (1 day delivery)', value: 'Delivery' },
					{ label: 'Laundry (Takes 2-3 days)', value: 'Laundry' },
					{ label: 'Dry Clean (Takes 3-4 day)', value: 'Dry Clean' },
				],
			},
		},
	];

	function removeArticleFromBasket(id: string) {
		let articleIdsInBag = $APP.ArticlesInBag;
		let index = articleIdsInBag.findIndex((val) => val === id);

		articleIdsInBag.splice(index, 1);

		$APP.ArticlesInBag = articleIdsInBag;
	}

	async function submitForm() {
		loading = true;
		try {
			const params = {
				articles: $APP.ArticlesInBag,
				type: order.Type,
			};
			const resp = await placeOrderAndFetchPrice(params);
			if (resp && resp.ID) {
				if (resp.Price.Total === 0) {
					const confirm_resp = await cofirmOrder({
						orderId: resp.ID,
					});
					if (!confirm_resp) return addError('Something went wrong. Please try again after sometime', 10);
					addNotice('Order placed successfully.');
					$APP.ArticlesInBag = [];
					return goto('/orders');
				}
				bottomSheetStore.setSheet({
					show: true,
					children: OrderDetails as typeof SvelteComponent,
					props: {
						order: resp,
						referrerComponent: 'basket',
					},
				});
			}
		} finally {
			loading = false;
		}
	}

	$: disabled = !form || !form.checkValidity() || !order;
</script>

<h1 class="fw-bold mb-3">My Basket</h1>
{#if !itemsInBag.length}
	<p class="fs-6 text-center">No items in the bag.</p>
{/if}
<div class="mb-3 d-flex flex-column gap-3">
	{#each itemsInBag as article}
		<div class="bg-white p-2 d-flex align-items-center gap-2">
			<img class="rounded border border-black" width="100" height="100" src={article.Images[0]} alt="Article Image" />
			<div class="d-flex flex-column gap-2">
				<p class="m-0 fs-5 fw-bold">{article.Name}</p>
				<button class="border-0 chip bg-secondary text-primary p-1 rounded fw-bold shadow" on:click|stopPropagation={() => removeArticleFromBasket(article.ID)}> Remove from basket </button>
			</div>
		</div>
	{/each}
</div>

<form method="post" class="position-relative d-flex flex-column flex-grow-1 justify-content-between gap-2" bind:this={form} on:submit|preventDefault={submitForm}>
	<div class="narrow-form">
		{#each fields as { key, definition }}
			<div class="mb-3" data-field={key}>
				<Field {key} {definition} bind:value={order[key]} />
			</div>
		{/each}
	</div>

	<button class="d-none">Needed for ENTER to submit</button>
	<button on:click={() => form.checkValidity()} type="submit" class="btn btn-primary text-uppercase mb-3 d-flex justify-content-center gap-2" {disabled}>
		proceed to checkout {#if loading}<Loader />{/if}</button>
</form>

<style lang="scss">
</style>
