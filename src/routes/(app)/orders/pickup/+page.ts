import type { PageLoad } from './$types';
export const load: PageLoad = async () => {
	return {
		back_button: true,
	};
};
