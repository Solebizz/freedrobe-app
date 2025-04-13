<script lang="ts">
	import CardDetail from '$lib/components/card_detail.svelte';
	import { bottomSheetStore } from '$lib/stores/bottom_sheet';
	import type { SvelteComponent } from 'svelte';

	const image =
		'https://s3-alpha-sig.figma.com/img/34ee/b408/fa1f041b554a9755cf0e6c420731bb59?Expires=1745193600&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=fXd0kPAwH-GbwMGJM8hjMwQtSqIoqmzCnROmvC5idN3C3UQGeIR4ov8S6X9aL3Lm4e9Nuxi4faJf2yddkLkmNMSgwTsd9IcNRAZ8mBGZSFTWo8fn0f8zbS1EqryT3mbd7rEqx0eJ5gEnvpjkiKimm9NOKkcNhKeYPz7XeEDZapa76LO-RUsvxGCGoegC5P6d1dKmAhgA5P7-glonZihQOGnJjOEl6wMXhh5AZo6mzDNIK-NbG4w8RtELR01aBq9SaT1zA3B0gySuixOiTprTlbHrlsT3f~Gtr0bt2gaPZsuWzCjehoyxIrXY1~fghYUjqx0BLFFw6-eLx3X1EzTJpw__';
	export let width = 200;
	export let border = 2;

	const cards = [
		{
			Title: 'Article 1',
			Status: 'Ready To Deliver',
			inBasket: false,
		},
		{
			Title: 'Article 2',
			Status: 'Ready To Deliver',
			inBasket: false,
		},
		{
			Title: 'Article 3',
			Status: 'Ready To Deliver',
			inBasket: false,
		},
		{
			Title: 'Article 3',
			Status: 'Ready To Deliver',
			inBasket: false,
		},
		{
			Title: 'Article 3',
			Status: 'Ready To Deliver',
			inBasket: false,
		},
		{
			Title: 'Article 3',
			Status: 'Ready To Deliver',
			inBasket: false,
		},
	];

	function toggleBasket(index: number) {
		cards[index].inBasket = !cards[index].inBasket;
	}

	function openCardDetails(index: number) {
		bottomSheetStore.setSheet({
			show: true,
			children: CardDetail as typeof SvelteComponent,
			handleClose: () => {
				console.log(`Sheet closed for ${cards[index].Title}`);
			},
		});
	}
</script>

<h1 class="fw-bold mb-3">My Closet</h1>
{#if !cards.length}
	<p class="fs-6">No items in the closet.</p>
{/if}
<div class="card-deck mb-3">
	{#each cards as card, index}
		<div class="card bg-white" on:click={() => openCardDetails(index)}>
			<div class="card-image card-img-top position-relative" style="background-image:url({image});--imgwidth:{width}px;--border:{border}px;">
				<button class="basket-btn position-absolute shadow" style="top: 0.5rem; right: 0.5rem;" on:click={() => toggleBasket(index)}>
					{card.inBasket ? 'Added ✅' : 'Quick Add ✙'}
				</button>
			</div>
			<div class="card-body">
				<h5 class="card-title fw-bold">{card.Title}</h5>
				<span class="badge bg-secondary p-2">{card.Status}</span>
			</div>
		</div>
	{/each}
</div>

<style lang="scss">
	.card-deck {
		display: grid;
		gap: 1rem;
		grid-template-columns: repeat(2, 1fr);

		@media (min-width: 600px) {
			grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		}
	}

	.card {
		position: relative;
		border-radius: 1rem;
		box-shadow: 0 0.1rem 0.3rem rgba(0, 0, 0, 0.1);
	}

	.card-image {
		width: 100%;
		height: var(--imgwidth);
		border-radius: 1rem;
		background-position: center;
		background-size: cover;
	}

	.basket-btn {
		background-color: rgba(0, 0, 0, 0.6);
		color: white;
		border: none;
		border-radius: 0.5rem;
		padding: 0.4rem 0.8rem;
		font-size: 0.8rem;
		cursor: pointer;
		transition: background-color 0.2s ease;
	}

	.basket-btn:hover {
		background-color: rgba(0, 0, 0, 0.8);
	}
</style>
