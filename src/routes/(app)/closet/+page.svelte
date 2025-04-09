<script lang="ts">
	const image =
		'https://s3-alpha-sig.figma.com/img/34ee/b408/fa1f041b554a9755cf0e6c420731bb59?Expires=1745193600&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=fXd0kPAwH-GbwMGJM8hjMwQtSqIoqmzCnROmvC5idN3C3UQGeIR4ov8S6X9aL3Lm4e9Nuxi4faJf2yddkLkmNMSgwTsd9IcNRAZ8mBGZSFTWo8fn0f8zbS1EqryT3mbd7rEqx0eJ5gEnvpjkiKimm9NOKkcNhKeYPz7XeEDZapa76LO-RUsvxGCGoegC5P6d1dKmAhgA5P7-glonZihQOGnJjOEl6wMXhh5AZo6mzDNIK-NbG4w8RtELR01aBq9SaT1zA3B0gySuixOiTprTlbHrlsT3f~Gtr0bt2gaPZsuWzCjehoyxIrXY1~fghYUjqx0BLFFw6-eLx3X1EzTJpw__';
	export let width = 200;
	export let border = 2;

	const cards = [
		{
			Title: 'Article 1',
			Status: 'Ready To Deliver',
		},
		{
			Title: 'Article 1',
			Status: 'Ready To Deliver',
		},
		{
			Title: 'Article 1',
			Status: 'Ready To Deliver',
		},
	];
</script>

<h1 class="fw-bold mb-3">My Closet</h1>
{#if !cards.length}
	<p class="fs-6">No items in the closet.</p>
{/if}
<div class="card-deck d-flex gap-3 mb-3 flex-wrap">
	{#each cards as card}
		<div class="card bg-white">
			<div class="card-image card-img-top" style="background-image:url({image});--imgwidth:{width}px;--border:{border}px;"></div>
			<div class="card-body">
				<h5 class="card-title fw-bold">{card.Title}</h5>
				<span class="badge bg-secondary p-2">{card.Status}</span>
			</div>
		</div>
	{/each}
</div>

<style lang="scss">
	.card {
		width: 100%;
		max-width: 25rem;
	}
	.card-image {
		width: auto;
		height: var(--imgwidth);
		border-radius: 1rem;
		background-position: center;
		background-size: cover;
	}
</style>
