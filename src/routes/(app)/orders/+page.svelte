<script lang="ts">
	import { goto } from '$app/navigation';
	import CardDetail from '$lib/components/card_detail.svelte';
	import { bottomSheetStore } from '$lib/stores/bottom_sheet';

	function handlePickupClick() {
		goto('/orders/pickup');
	}
</script>

<h1 class="fw-bold mb-3">My Orders</h1>
<div class="d-flex align-items-center flex-column">
	<p class="fs-6 text-center">No items in the orders yet.</p>
	<button on:click={handlePickupClick} class="btn btn-secondary w-75">Place your first pickup 🤩</button>
</div>
