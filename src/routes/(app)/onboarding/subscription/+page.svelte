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

<div class="px-3">
	<div class="bg-white p-4 rounded-4 shadow-sm">
		<SusbscriptionList />
	</div>
</div>
