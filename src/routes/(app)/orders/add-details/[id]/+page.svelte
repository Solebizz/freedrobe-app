<script lang="ts">
	import { APP } from '$lib/stores/appMain.js';
	import { addError } from '$lib/stores/notices';

	export let data;

	const orderId = data.id;
	const orderInfo = $APP.Orders && $APP.Orders[orderId];
</script>

{#if !orderInfo}
	<p class="text-center">Order id is incorrect!</p>
{/if}
