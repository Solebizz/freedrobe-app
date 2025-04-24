import { env } from '$env/dynamic/public';
import { APP } from '$lib/stores/appMain';
import { addError } from '$lib/stores/notices';
import { get } from 'svelte/store';
import { fetchAuthHeadrs, serializeResponse } from './globals';

interface IServerResponse<T = unknown> {
	status: number;
	success: boolean;
	message: string;
	data: T;
}
// Get OTP ✅
export async function getOTP(phone: string) {
	interface IOTP {
		sessionId: string;
	}
	try {
		const headers = new Headers();
		headers.append('Content-Type', 'application/json');
		const body = {
			phone,
		};
		const requestOptions = {
			method: 'POST',
			headers,
			body: JSON.stringify(body),
		};
		const res = await fetch(`${env.PUBLIC_ADMIN_URL}/public/users/request-otp`, requestOptions);
		const jsonResp: IServerResponse<IOTP> = await res.json();
		if (!jsonResp || typeof jsonResp !== 'object') throw Error('Server error. Not an object. ⛔️');
		if (res.status !== 200 && 'message' in jsonResp && typeof jsonResp.message === 'string') throw Error(jsonResp.message);
		if (!('data' in jsonResp) || typeof jsonResp.data !== 'object' || !jsonResp.data) throw Error('Server error. ⛔️');
		const data = jsonResp.data as IOTP;
		const serializedSignInInfo = serializeResponse<App.IOTP, IOTP>(data, {
			SessionID: 'sessionId',
		});
		return serializedSignInInfo;
	} catch (e) {
		const message = (e as Error).message || 'Unkown error';
		addError(message, 5);
		console.error(message);
	}
}
export interface IAddressInfo {
	line1: string;
	line2: string;
}
export interface IUserInfo {
	phone: string;
	user_role: string;
	storageValue: number;
	washValue: number;
	dryCleanValue: number;
	logisticValue: number;
	activeSubscription: number;
	deleted: boolean;
	blocked: boolean;
	blockedReason: string;
	address?: IAddressInfo;
	gender?: string;
	locationId?: string;
	name?: string;
	subscriptionId?: string;
	subscriptionValidTill?: string;
	subscriptionValidityPeriod?: string;
}
interface IVerifyOTPParams {
	sessionId: string;
	otp: string;
}
// Verify OTP and get user info
export async function verifyOTPAndGetUserInfo(params: IVerifyOTPParams) {
	const { sessionId, otp } = params;
	interface IAuthInfo {
		refreshToken: string;
		authToken: string;
		authTokenExpiryAt: number;
		refershTokenExpiryAt: number;
	}

	interface IVerifyOTPReponseFromServer extends IAuthInfo {
		user: IUserInfo;
	}
	try {
		const headers = new Headers();
		headers.append('Content-Type', 'application/json');
		const body = {
			sessionId,
			otp,
		};
		const requestOptions = {
			method: 'POST',
			headers,
			body: JSON.stringify(body),
		};
		const res = await fetch(`${env.PUBLIC_ADMIN_URL}/public/users/verify-otp`, requestOptions);
		const jsonResp: IServerResponse<IVerifyOTPReponseFromServer> = await res.json();
		if (!jsonResp || typeof jsonResp !== 'object') throw Error('Server error. Not an object. ⛔️');
		if (res.status !== 200 && 'message' in jsonResp && typeof jsonResp.message === 'string') throw Error(jsonResp.message);
		if (!('data' in jsonResp) || typeof jsonResp.data !== 'object' || !jsonResp.data) throw Error('Server error. ⛔️');
		const data = jsonResp.data as IVerifyOTPReponseFromServer;
		const authInfo = serializeResponse<App.IAuthInfo, IAuthInfo>(data, {
			AuthToken: 'authToken',
			AuthTokenExpiryAt: 'authTokenExpiryAt',
			RefreshToken: 'refreshToken',
			RefershTokenExpiryAt: 'refershTokenExpiryAt',
		});
		const userInfo = serializeResponse<App.IUserInfo, IUserInfo>(data.user, {
			Phone: 'phone',
			UserRole: 'user_role',
			StorageValue: 'storageValue',
			WashValue: 'washValue',
			DryCleanValue: 'dryCleanValue',
			LogisticValue: 'logisticValue',
			ActiveSubscription: 'activeSubscription',
			Deleted: 'deleted',
			Blocked: 'blocked',
			BlockedReason: 'blockedReason',
			Address: (u) => {
				const defaults = {
					Line1: '',
					Line2: '',
				};
				if (!u.address) return defaults;
				return serializeResponse<App.IAddressInfo, IAddressInfo>(u.address, {
					Line1: 'line1',
					Line2: 'line2',
				});
			},
			Gender: 'gender',
			LocationId: 'locationId',
			Name: 'name',
			SubscriptionId: 'subscriptionId',
			SubscriptionValidTill: 'subscriptionValidTill',
			SubscriptionValidityPeriod: 'subscriptionValidityPeriod',
		});
		return { authInfo, userInfo };
	} catch (e) {
		const message = (e as Error).message || 'Unkown error';
		addError(message, 5);
		console.error(message);
	}
}

// Fetch Locations
export async function getLocationsInfo() {
	interface ILocationInfo {
		_id: string;
		area: string;
		city: string;
		state: string;
	}
	interface ILocationsInfoFromServer {
		locations: ILocationInfo[];
	}
	try {
		const requestOptions = {
			method: 'GET',
		};
		const res = await fetch(`${env.PUBLIC_ADMIN_URL}/public/locations`, requestOptions);
		const jsonResp: IServerResponse<ILocationsInfoFromServer> = await res.json();
		if (!jsonResp || typeof jsonResp !== 'object') throw Error('Server error. Not an object. ⛔️');
		if (res.status !== 200 && 'message' in jsonResp && typeof jsonResp.message === 'string') throw Error(jsonResp.message);
		if (!('data' in jsonResp) || typeof jsonResp.data !== 'object' || !jsonResp.data) throw Error('Server error. ⛔️');
		const data = jsonResp.data as ILocationsInfoFromServer;
		const locations: Record<string, App.ILocationInfo> = {};
		for (let location of data.locations) {
			locations[location._id] = serializeResponse<App.ILocationInfo, ILocationInfo>(location, {
				ID: '_id',
				Area: 'area',
				City: 'city',
				State: 'state',
			});
		}
		return locations;
	} catch (e) {
		const message = (e as Error).message || 'Unkown error';
		addError(message, 5);
		console.error(message);
	}
}

interface ISaveUserInfoParams {
	name: string;
	gender: string;
	address: IAddressInfo;
	locationId: string;
}
// save user info
export async function saveUserInfo(params: ISaveUserInfoParams) {
	try {
		const $APP = get(APP);
		const headers = {
			...(await fetchAuthHeadrs($APP)),
		};
		const requestOptions = {
			method: 'PUT',
			headers,
			body: JSON.stringify(params),
		};
		const res = await fetch(`${env.PUBLIC_ADMIN_URL}/secure/users`, requestOptions);
		const jsonResp: IServerResponse<IUserInfo> = await res.json();
		if (!jsonResp || typeof jsonResp !== 'object') throw Error('Server error. Not an object. ⛔️');
		if (res.status !== 200 && 'message' in jsonResp && typeof jsonResp.message === 'string') throw Error(jsonResp.message);
		if (!('data' in jsonResp) || typeof jsonResp.data !== 'object' || !jsonResp.data) throw Error('Server error. ⛔️');
		const data = jsonResp.data as IUserInfo;
		const userInfo = serializeResponse<App.IUserInfo, IUserInfo>(data, {
			Phone: 'phone',
			UserRole: 'user_role',
			StorageValue: 'storageValue',
			WashValue: 'washValue',
			DryCleanValue: 'dryCleanValue',
			LogisticValue: 'logisticValue',
			ActiveSubscription: 'activeSubscription',
			Deleted: 'deleted',
			Blocked: 'blocked',
			BlockedReason: 'blockedReason',
			Address: (d) => {
				const defaults = {
					Line1: '',
					Line2: '',
				};
				if (!d.address) return defaults;
				return serializeResponse<App.IAddressInfo, IAddressInfo>(d.address, {
					Line1: 'line1',
					Line2: 'line2',
				});
			},
			Gender: 'gender',
			LocationId: 'locationId',
			Name: 'name',
			SubscriptionId: 'subscriptionId',
			SubscriptionValidTill: 'subscriptionValidTill',
			SubscriptionValidityPeriod: 'subscriptionValidityPeriod',
		});
		return userInfo;
	} catch (e) {
		const message = (e as Error).message || 'Unkown error';
		addError(message, 5);
		console.error(message);
	}
}

// Fetch Locations
export async function getSubscriptionsList() {
	interface IBenefitsInfo {
		storageValue: number;
		washValue: number;
		dryCleanValue: number;
		logisticValue: number;
	}
	interface ISubscriptionInfo {
		_id: string;
		title: string;
		description: string;
		features: string[];
		price: number;
		currency: string;
		currentlySubscribed: number;
		private: boolean;
		paymentCycle: string;
		validity: string;
		deleted: boolean;
		benefits: IBenefitsInfo;
	}
	interface ISubscriptionsInfoFromServer {
		subscriptions: ISubscriptionInfo[];
	}
	try {
		const requestOptions = {
			method: 'GET',
		};
		const res = await fetch(`${env.PUBLIC_ADMIN_URL}/public/subscriptions`, requestOptions);
		const jsonResp: IServerResponse<ISubscriptionsInfoFromServer> = await res.json();
		if (!jsonResp || typeof jsonResp !== 'object') throw Error('Server error. Not an object. ⛔️');
		if (res.status !== 200 && 'message' in jsonResp && typeof jsonResp.message === 'string') throw Error(jsonResp.message);
		if (!('data' in jsonResp) || typeof jsonResp.data !== 'object' || !jsonResp.data) throw Error('Server error. ⛔️');
		const data = jsonResp.data as ISubscriptionsInfoFromServer;
		const subscriptions: Record<string, App.ISubscriptionInfo> = {};
		for (let subscription of data.subscriptions) {
			subscriptions[subscription._id] = serializeResponse<App.ISubscriptionInfo, ISubscriptionInfo>(subscription, {
				ID: '_id',
				Title: 'title',
				Description: 'description',
				Features: 'features',
				Price: 'price',
				Currency: 'currency',
				CurrentlySubscribed: 'currentlySubscribed',
				Private: 'private',
				PaymentCycle: 'paymentCycle',
				Validity: 'validity',
				Deleted: 'deleted',
				Benefits: (s) =>
					serializeResponse<App.IBenefitsInfo, IBenefitsInfo>(s.benefits, {
						StorageValue: 'storageValue',
						WashValue: 'washValue',
						DryCleanValue: 'dryCleanValue',
						LogisticValue: 'logisticValue',
					}),
			});
		}
		return subscriptions;
	} catch (e) {
		const message = (e as Error).message || 'Unkown error';
		addError(message, 5);
		console.error(message);
	}
}
