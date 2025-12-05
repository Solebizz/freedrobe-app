<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Loader from '$lib/components/loader.svelte';
	import MainHeader from '$lib/components/main_header.svelte';
	import Nav from '$lib/components/nav.svelte';
	import { APP } from '$lib/stores/appMain';
	import { onboardingStep, setOnboardingStep } from '$lib/stores/onboarding';
	import { onMount } from 'svelte';

	let loading = false;

	// Extract current pathname into a reactive variable
	$: currentPathname = $page.url.pathname;

	// Check if user is endUser
	$: isEndUser = $APP.User?.UserRole === 'endUser';

	// Check if current route is onboarding OR if user should be in onboarding (only for endUsers)
	$: isOnboardingRoute = isEndUser && (currentPathname.startsWith('/onboarding') || !$APP.User?.LocationId || ($APP.User?.LocationId && !$APP.User?.ActiveSubscription));

	// Show bottom nav for non-endUsers always, or for endUsers when not on onboarding
	$: showBottomNav = isEndUser ? !currentPathname.startsWith('/onboarding') && $APP.User?.LocationId && $APP.User?.ActiveSubscription : true; // Always show nav for non-endUsers

	// Show logo-only header only for endUsers on onboarding
	$: showLogoOnlyHeader = isEndUser && currentPathname.startsWith('/onboarding');

	// Update onboarding step store based on current route
	$: {
		if (isEndUser && currentPathname.startsWith('/onboarding')) {
			const step = currentPathname === '/onboarding' ? 1 : currentPathname === '/onboarding/subscription' ? 2 : currentPathname === '/onboarding/pickup' ? 3 : 0;

			if (step > 0) {
				setOnboardingStep(step);
			}
		}
	}

	// Remove all onboarding title text
	$: onboardingTitle = '';

	$: onboardingSubtitle = ''; // Remove subtitle text

	onMount(() => {
		if (!$APP.Auth?.AuthToken || !$APP.Auth?.RefreshToken) {
			// TODO revisit this again
			// addError('Something went wrong. Please login again.');
			goto('/login', { replaceState: true });
			return;
		}

		// Only check onboarding for endUser role
		if (isEndUser) {
			// Check if user needs to complete profile
			if (!$APP.User?.LocationId && currentPathname !== '/onboarding') {
				goto('/onboarding', { replaceState: true });
				return;
			}

			// Check if user needs to subscribe
			if ($APP.User?.LocationId && !$APP.User?.ActiveSubscription && currentPathname !== '/onboarding/subscription') {
				goto('/onboarding/subscription', { replaceState: true });
				return;
			}

			// Check if user has no orders and is on orders page
			if ($APP.User?.LocationId && $APP.User?.ActiveSubscription && currentPathname === '/orders' && (!$APP.Orders || Object.keys($APP.Orders).length === 0)) {
				goto('/onboarding/pickup', { replaceState: true });
				return;
			}
		}
	});

	// Watch for changes in the route and user data (only for endUsers)
	$: if ($APP.User && isEndUser) {
		// Redirect to profile step if no LocationId
		if (!$APP.User.LocationId && currentPathname !== '/onboarding') {
			goto('/onboarding', { replaceState: true });
		}
		// Redirect to subscription step if has LocationId but no subscription
		else if ($APP.User.LocationId && !$APP.User.ActiveSubscription && currentPathname !== '/onboarding/subscription') {
			goto('/onboarding/subscription', { replaceState: true });
		}
	}

	// Watch for auth changes - if auth is cleared, redirect to login
	$: if (!$APP.Auth?.AuthToken || !$APP.Auth?.RefreshToken) {
		setTimeout(() => {
			window.location.href = '/login';
		}, 250);
	}
</script>

{#if loading}
	<div class="vh-100 d-flex align-items-center justify-content-center">
		<Loader />
	</div>
{:else}
	<div id="outermost_app_wrap">
		<MainHeader logo_only={showLogoOnlyHeader} onboarding_title={onboardingTitle} onboarding_subtitle={onboardingSubtitle} />
		<div id="main_container" class="bg-body-tertiary" class:px-3={!isOnboardingRoute} class:pt-3={!isOnboardingRoute}>
			<slot />
		</div>
		{#if showBottomNav}
			<Nav />
		{/if}
	</div>
{/if}

<style lang="scss">
	#outermost_app_wrap {
		display: flex;
		flex-direction: column;
		height: 100vh;
	}
	#main_container {
		flex-grow: 1;
		flex-shrink: 1;
		overflow: auto;
		display: flex;
		flex-direction: column;
	}
</style>
