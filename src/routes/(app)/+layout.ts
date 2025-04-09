/** @type {import('./$types').PageLoad} */
export async function load() {
	return {
		the_ctas: [
			{
				href: '/basket',
				icon: 'bag-heart',
			},
		],
	};
}
