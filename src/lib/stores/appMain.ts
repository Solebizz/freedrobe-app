import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const APP_DATA_KEY = 'main_app_data';

const defaultAppData: App.IData = {
	LoadedFromLocalStorage: false,
	ArticlesInBag: [],
};

/*
 * if you copy this code, refactor into a common `createLocalStorageStore` function
 */
let initialValue = { ...defaultAppData };
if (browser) {
	const local_storage_str = localStorage.getItem(APP_DATA_KEY);
	try {
		if (!local_storage_str) throw new Error('No data found in local storage must initialize');
		const local_storage_obj = JSON.parse(local_storage_str);
		if (typeof local_storage_obj !== 'object') throw new Error('Local storage data is not an object');
		local_storage_obj.LoadedFromLocalStorage = true;
		initialValue = local_storage_obj;
	} catch (error) {
		initialValue.LoadedFromLocalStorage = true;
	}
}
export const APP = writable(initialValue);

APP.subscribe((value) => {
	if (browser) localStorage.setItem(APP_DATA_KEY, JSON.stringify(value));
});
