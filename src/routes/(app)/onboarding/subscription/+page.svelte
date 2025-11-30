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

<div class="onboarding-header-content">
	<h1 class="fw-bold fs-3 text-center mb-2">Choose Your Plan</h1>
	<p class="text-center px-3">Step 2 of 2: Select a subscription to get started</p>
</div>

<div class="onboarding-content">
	<div class="mb-5 p-3 py-3 rounded-4 bg-white shadow-lg">
		<SusbscriptionList />
	</div>
</div>
