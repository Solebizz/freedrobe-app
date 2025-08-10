<script lang="ts">
	import { goto } from '$app/navigation';
	import AddArticleDetails from '$lib/components/add_article_details.svelte';
	import { APP } from '$lib/stores/appMain.js';
	import { bottomSheetStore } from '$lib/stores/bottom_sheet';
	import { completeOrder } from '$lib/utils/apis';
	import { DateTime } from 'luxon';

	export let data;

	const orderId = data.id;
	const order = $APP.Orders && $APP.Orders[orderId];

	let articleInfo: Record<string, any>[] = [];

	function toggleArticleDetails(index: number) {
		bottomSheetStore.setSheet({
			show: true,
			children: AddArticleDetails,
			props: {
				index,
				article: articleInfo[index],
				updateArticleInfo: (info: Record<string, any>) => (articleInfo[index] = info),
			},
		});
	}

	async function handleSubmit() {
		articleInfo = articleInfo.map((item) => ({ ...item, images: [item.image] }));
		const params = {
			items: articleInfo,
			orderId,
		};
		await completeOrder(params).finally(() => goto('/orders'));
	}
</script>

{#if !order || (order && order.Status !== 'Picked Up')}
	<p class="text-center">Order id is incorrect!</p>
{:else}
	<div>
		<p class="m-0 fs-5">Order Details</p>
		<p class="mt-3 m-0"><strong>Order Type:</strong> {order.Type}</p>
		<p><strong>Order Status:</strong> {order.Status}</p>
		<p class="m-0"><strong>Receipt ID:</strong> {order.ReceiptID}</p>
		<p class="m-0"><strong>Placed on:</strong> {DateTime.fromISO(order.CreatedAt).toFormat('dd LLL yyyy, hh:mma')}</p>
		<p><strong>No. of Articles:</strong> {order.NoOfArticles}</p>
		<p class="m-0"><strong>Order Total:</strong> ₹{order.Price.BasePrice}</p>
		<p class="m-0"><strong>Discount:</strong> ₹{order.Price.Discount}</p>
		<p class="m-0"><strong>Sub Total:</strong> ₹{order.Price.Total}</p>
	</div>
	<div class="mt-4">
		{#if order.NoOfArticles}
			<p class="m-0 fs-5">Add Articles</p>
			<div class="d-flex flex-wrap gap-2 mt-3">
				{#each Array(order.NoOfArticles || 0) as _, i}
					<button class="btn border rounded p-4" on:click={() => toggleArticleDetails(i)}>
						{#if articleInfo[i]}
							EDIT
						{:else}
							ADD
						{/if}
					</button>
				{/each}
			</div>
			<button class="btn btn-primary text-uppercase mt-2" disabled={articleInfo.length !== order?.NoOfArticles} on:click={handleSubmit}>Submit Details</button>
		{/if}
	</div>
{/if}
