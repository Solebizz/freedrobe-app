<script lang="ts">
	import OnboardingPickup from '$lib/components/onboarding_pickup.svelte';
	import { APP } from '$lib/stores/appMain';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	onMount(() => {
		// If user doesn't have LocationId, redirect back to profile step
		if (!$APP.User?.LocationId) {
			goto('/onboarding', { replaceState: true });
			return;
		}

		// If user doesn't have subscription, redirect to subscription step
		if (!$APP.User?.ActiveSubscription) {
			goto('/onboarding/subscription', { replaceState: true });
			return;
		}
	});
</script>

<OnboardingPickup isOnboardingFlow={true} />
