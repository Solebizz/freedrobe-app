<script lang="ts">
	import Loader from '$lib/components/loader.svelte';
	import OrderDetails from '$lib/components/order_details.svelte';
	import { APP } from '$lib/stores/appMain';
	import { bottomSheetStore } from '$lib/stores/bottom_sheet';
	import { placeOrderAndFetchPrice } from '$lib/utils/apis';
	import type { SvelteComponent } from 'svelte';

	export let width = 200;
	export let border = 2;

	let loading = false;

	let selectedService: Record<string, string>;

	$: itemsInBag = Array.isArray($APP.ArticlesInBag) && $APP.Articles ? $APP.ArticlesInBag.map((id) => $APP.Articles?.[id]).filter((item) => item !== undefined) : [];

	const serviceType = [
		{
			Label: 'Get your stored item delivered to your doorstep within 24 hours.',
			Value: 'Delivery',
		},
		{ Label: 'Standard wash and fold to keep your clothes fresh and clean.', Value: 'Laundry' },
		{ Label: 'Gentle, professional cleaning for delicate or special garments.', Value: 'Dry Clean' },
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
				type: selectedService.Value,
			};
			const resp = await placeOrderAndFetchPrice(params);
			if (resp && resp.ID) {
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

	// $: disabled = !form || !form.checkValidity() || !order;
	$: disabled = !selectedService;
</script>

<h1 class="fw-bold mb-3 fs-5">My Basket</h1>
{#if !itemsInBag.length}
	<p class="fs-6 text-center">No items in the basket.</p>
{:else}
	<div class="mb-3 d-flex flex-column gap-3">
		{#each itemsInBag as article}
			<div class="bg-white p-2 d-flex align-items-center h-100">
				<img class="rounded border border-black" width="80" height="100" src={article.Images[0]} alt="Article Image" />
				<div class="d-flex flex-column align-items-between h-100 py-2">
					<div class="h-100">
						<p class="m-0 fs-5 fw-bold ms-3">{article.Name}</p>
						<p class="mt-1 ms-3">{article.Category}</p>
					</div>
					<button class="m-0 fw-bold text-danger border-0 bg-transparent px-0" on:click|stopPropagation={() => removeArticleFromBasket(article.ID)}> Remove </button>
				</div>
			</div>
		{/each}
	</div>

	<p class="mt-3 fw-bold fs-5">Select Service</p>
	<form class="d-flex flex-column gap-2" on:submit|preventDefault={submitForm}>
		{#each serviceType as st}
			<div class="selectBox-ssa radio">
				<input type="radio" name="radio" id={st.Value} value={st} bind:group={selectedService} />
				<label class="rounded-3 border" for={st.Value}>
					<div class="d-flex justify-content-between">
						<p class="fw-bold fs-5 m-0">{st.Value}</p>
					</div>
					<p class="m-0 mt-1">{st.Label}</p>
				</label>
			</div>
		{/each}

		<button type="submit" class="btn btn-primary text-uppercase mb-3 d-flex justify-content-center gap-2 mt-2" {disabled}>
			proceed to checkout {#if loading}<Loader />{/if}</button>
	</form>
{/if}

<style lang="scss">
	.selectBox-ssa {
		.currency {
			position: relative;
			top: -0.25rem;
		}
		input {
			display: none;
			&:checked {
				+ label {
					display: block;
					border-color: var(--bs-secondary);
					z-index: 1;
					box-shadow: 0 0 0 3px var(--bs-tertiary-bg);
					background-color: var(--bs-secondary-bg);
					color: var(--bs-primary);
					&:before {
						background: var(--bs-primary);
						box-shadow: 0 0 0 1px var(--bs-secondary);
					}
				}
			}
		}
		label {
			display: block;
			border: 1px solid var(--bs-tertiary-bg);
			position: relative;
			padding: 15px 15px 15px 40px;
			cursor: pointer;
			&:before {
				content: '';
				width: 15px;
				height: 15px;
				box-shadow: 0 0 0 1px var(--bs-tertiary-bg);
				border: 3px solid var(--bs-white);
				position: absolute;
				left: 15px;
				top: 37%;
				transform: translateY(-50%);
			}
			&:hover {
				border-color: var(--bs-secondary-bg);
				z-index: 1;
			}
		}
		&.radio {
			label {
				&:before {
					border-radius: 100%;
				}
			}
		}
	}
</style>
