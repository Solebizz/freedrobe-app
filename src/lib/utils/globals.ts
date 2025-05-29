export const logoSrc = '/imgs/main_app_logo.png';

export const logoFullSrc = '/imgs/main_app_logo_full.png';

export const termsUrl = 'https://freedrobe.com/terms-conditions';
export const privacyUrl = 'https://freedrobe.com/privacy-policy';
export const contactusUrl = 'https://freedrobe.com/contact/';
export const protectionPlanUrl = 'https://freedrobe.com/protection-plan-terms/';
export const deleteUrl = 'https://freedrobe.com/delete-my-data/';

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

/**
 * Takes key value pairs in the form of {key_in_app: key_in_core} and returns an object with the values in the form the app needs them
 * @param {Object} obj as provided by Core
 * @param {Record<string,string|function>} map in the form of {key_in_app: key_in_core} key_in_core can be a (item)=> some processing
 * @returns {Object} in the form of {key_in_app: value}
 */
export function serializeResponse<J extends object, T extends object>(obj: T, map: { [P in keyof J]: Extract<keyof T, string> | ((obj: T) => any) }): J {
	let res = {};
	for (let key_in_app in map) {
		let key_in_core = map[key_in_app];
		if (typeof key_in_core === 'string') {
			//@ts-ignore it could be any
			res[key_in_app] = obj[key_in_core];
		} else if (key_in_core instanceof Function) {
			//@ts-ignore it could be any
			res[key_in_app] = key_in_core(obj);
		} else {
			throw new Error(`invalid map for key '${key_in_core}'`);
		}
	}
	return res as J;
}

export async function fetchAuthHeadrs($APP: App.IData, staff = false): Promise<HeadersInit> {
	return {
		authToken: (staff ? $APP.Staff?.Auth?.AuthToken : $APP.Auth?.AuthToken) || '',
	};
}

export const entityName = 'Freedrobe';

export function noop() {}
