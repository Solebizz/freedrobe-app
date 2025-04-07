export const logoSrc = '/imgs/main_app_logo.png';

export const termsUrl = 'https://freedrobe.com/?fwe';

/**
 * Returns the significant part of a route so it can be evaluated to highlight navigation items
 */
export function extractRoute(inputString: string, subnav = false) {
	//for non-staff routes use the first part of the path
	// const match = decodeURIComponent(inputString).match(/^\/([^/]+)/);

	// Ensure the path starts with a '/'
	if (!inputString.startsWith('/')) {
		inputString = '/' + inputString;
	}
	const regex = /\/[^\/]+/g;
	const pathSegments = inputString.match(regex);
	if (!subnav && pathSegments && pathSegments[0] === '/staff') {
		return pathSegments[1]; // remove query params
	}

	const match = decodeURIComponent(inputString).match(/^\/([^/]+)/);
	return match ? match[1] : null;
}
