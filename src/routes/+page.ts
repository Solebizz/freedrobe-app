import { APP } from '$lib/stores/appMain';
import { getUserInfo, getOrdersList } from '$lib/utils/apis';
import { SplashScreen } from '@capacitor/splash-screen';
import { get } from 'svelte/store';

/** @type {import('./$types').LayoutPageLoad} */
export async function load() {
	// Keep native splash visible initially
	let $APP = get(APP);

	// Return the data instead of redirecting immediately
	// This allows the page to mount and show custom splash
	if ($APP.Auth?.AuthToken) {
		const resp = await getUserInfo();
		if (!resp?.userInfo) {
			await SplashScreen.hide();
			return { redirectTo: '/login', reason: 'no_user_info' };
		}

		$APP.User = resp?.userInfo;
		APP.set($APP);

		// Check onboarding status (only for endUser role)
		if ($APP.User.UserRole === 'endUser') {
			if (!$APP.User.LocationId) {
				await SplashScreen.hide();
				return { redirectTo: '/onboarding', reason: 'needs_profile' };
			} else if (!$APP.User.ActiveSubscription) {
				await SplashScreen.hide();
				return { redirectTo: '/onboarding/subscription', reason: 'needs_subscription' };
			} else {
				// Check if user has any orders
				const ordersResp = await getOrdersList({ limit: 1, start: 0 });
				if (ordersResp && (!ordersResp.orders || Object.keys(ordersResp.orders).length === 0)) {
					await SplashScreen.hide();
					return { redirectTo: '/onboarding/pickup', reason: 'needs_first_pickup' };
				}
			}
		}

		await SplashScreen.hide();
		return { redirectTo: '/closet', reason: 'authenticated' };
	}

	await SplashScreen.hide();
	return { redirectTo: '/login', reason: 'no_auth' };
}
