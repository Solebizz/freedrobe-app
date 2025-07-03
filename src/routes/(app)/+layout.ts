import { APP } from '$lib/stores/appMain';
import { get } from 'svelte/store';

/** @type {import('./$types').PageLoad} */
export async function load() {
	const $APP = get(APP);
	const ctas =
		$APP.User?.UserRole === 'endUser'
			? [
					{
						href: '/basket',
						icon: 'bag-heart',
					},
				]
			: [];
	return {
		the_ctas: ctas,
	};
}
