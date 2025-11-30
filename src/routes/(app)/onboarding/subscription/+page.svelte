<script lang="ts">
	import { goto } from '$app/navigation';
	import { APP } from '$lib/stores/appMain';
	import SusbscriptionList from '$lib/components/susbscription_list.svelte';
	import { onMount } from 'svelte';

	onMount(() => {
		// If user doesn't have LocationId, redirect back to profile step
		if (!$APP.User?.LocationId) {
			goto('/onboarding', { replaceState: true });
			return;
		}

		// If user already has subscription, redirect to profile
		if ($APP.User?.ActiveSubscription) {
			goto('/profile', { replaceState: true });
			return;
		}
	});
</script>

<div class="onboarding-container">
	<div class="onboarding-header os_top_padding">
		<h1 class="fw-bold fs-3 text-center mb-2">Choose Your Plan</h1>
		<p class="text-center px-3">Step 2 of 2: Select a subscription to get started</p>
	</div>

	<main class="onboarding-main bg-body-tertiary pt-3 px-3">
		<div class="mb-5 p-3 py-3 rounded-4 bg-white shadow-lg">
			<SusbscriptionList />
		</div>
	</main>
</div>

<style lang="scss">
	.onboarding-container {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		background-color: var(--bs-body-bg);
	}

	.onboarding-header {
		padding: 1.5rem 1rem;
	}

	.onboarding-main {
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow: auto;
	}
</style>
