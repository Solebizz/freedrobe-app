import { APP } from '$lib/stores/appMain';
import { SplashScreen } from '@capacitor/splash-screen';
import { redirect } from '@sveltejs/kit';
import { get } from 'svelte/store';

/** @type {import('./$types').LayoutPageLoad} */
export async function load() {
	SplashScreen.hide();
	let $APP = get(APP);

	if ($APP.Auth?.AuthToken) throw redirect(307, '/profile');
	throw redirect(307, '/login');
}
