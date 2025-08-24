import { APP } from '$lib/stores/appMain';
import { addError } from '$lib/stores/notices';
import { getUserInfo } from '$lib/utils/apis';
import { SplashScreen } from '@capacitor/splash-screen';
import { redirect } from '@sveltejs/kit';
import { get } from 'svelte/store';

/** @type {import('./$types').LayoutPageLoad} */
export async function load() {
	SplashScreen.hide();
	let $APP = get(APP);

	if ($APP.Auth?.AuthToken) {
		const resp = await getUserInfo();
		if (!resp?.userInfo) {
			// TODO revisit this again
			//addError('Error getting user info. Please login again');
			throw redirect(307, '/login');
		}

		$APP.User = resp?.userInfo;
		APP.set($APP);
		if ($APP.User.ActiveSubscription) throw redirect(307, '/closet');
		throw redirect(307, '/profile');
	}
	throw redirect(307, '/login');
}
