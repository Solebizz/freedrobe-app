<script lang="ts">
	import { goto } from '$app/navigation';
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	function handleClick() {
		dispatch('close');
		goto('subscription-list');
	}
</script>

<div class="mt-2 d-flex flex-column align-items-between">
	<div class="mt-3">
		<p class="fs-5 text-center fw-bold">Congrats 🥳.</p>
		<p class="text-center fw-bold">You have successfully updated your profile.</p>
		<p class="text-center mt-4">Next steps. Subscribe to schedule your first pickup.</p>
	</div>
	<button on:click={handleClick} class="submit-cta btn p-2 btn-primary w-100 d-flex align-items-center justify-content-center gap-2 shadow"><span>Subscribe</span></button>
</div>
