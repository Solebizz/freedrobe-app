<script lang="ts">
	import { DateTime } from 'luxon';

	export let order: App.IOrdersInfo;
</script>

<div class="order-card">
	<div class="d-flex justify-content-between align-items-center mt-2">
		<p class="m-0 fs-5 fw-bold">{order.Type} Order</p>
		<span class="chip bg-secondary text-primary p-1 rounded">{order.Status}</span>
	</div>
	<p class="mt-3 m-0"><strong>Receipt ID:</strong> {order.ID}</p>
	<p class="m-0"><strong>Placed on:</strong> {DateTime.fromISO(order.CreatedAt).toFormat('dd LLL yyyy, hh:mma')}</p>
	<p><strong>No. of Articles:</strong> {order.NoOfArticles}</p>
	<p class="m-0"><strong>Order Total:</strong> ₹{order.Price.BasePrice}</p>
	<p class="m-0"><strong>Discount:</strong> ₹{order.Price.Discount}</p>
	<p class="m-0"><strong>Sub Total:</strong> ₹{order.Price.Total}</p>

	{#if order.Articles.length > 0}
		<hr />
		<div>
			<p class="fw-bold fs-6">Articles:</p>
			{#each order.Articles as article}
				<div class="article">
					<p class="m-0 mb-2"><strong>{article.Name}</strong> ({article.Category}) - ₹{article.Price ?? 'N/A'}</p>
					{#if article.Images && article.Images.length > 0}
						<img src={article.Images[0]} alt="Article Image" height="80" />
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>

<style lang="scss">
	.article:not(:last-child) {
		margin-bottom: 0.5rem;
		border-bottom: 1px dashed #ddd;
	}
	.article {
		img {
			max-width: 80px;
			margin-bottom: 1rem;
		}

		&:last-child img {
			margin-bottom: 0;
		}
	}

	button {
		font-size: 0.8rem;
	}
	.chip {
		font-size: 0.8rem;
	}
</style>
