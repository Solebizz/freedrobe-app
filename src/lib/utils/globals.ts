export const logoSrc = '/imgs/main_app_logo.png';

export const logoFullSrc = '/imgs/main_app_logo_full.png';

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

export async function urltoFile(url: string, filename: string, mimeType: string): Promise<ArrayBuffer | File> {
	if (url.startsWith('data:')) {
		var arr = url.split(',');
		var mime = arr[0].match(/:(.*?);/)?.[1];
		var bstr = atob(arr[arr.length - 1]),
			n = bstr.length,
			u8arr = new Uint8Array(n);
		while (n--) {
			u8arr[n] = bstr.charCodeAt(n);
		}
		var file = new File([u8arr], filename, { type: mime || mimeType });
		return Promise.resolve(file);
	}
	return fetch(url).then((res) => res.arrayBuffer());
}
