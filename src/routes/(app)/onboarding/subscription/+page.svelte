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

<div class="onboarding-content">
	<div class="mb-5 p-3 py-3 rounded-4 bg-white shadow-lg">
		<SusbscriptionList />
	</div>
</div>
