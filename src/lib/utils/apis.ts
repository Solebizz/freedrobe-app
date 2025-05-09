import { env } from '$env/dynamic/public';
import { APP } from '$lib/stores/appMain';
import { addError, addNotice } from '$lib/stores/notices';
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
	totalStorageValue: number;
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
// Verify OTP and get user info ✅
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
			TotalStorageValue: 'totalStorageValue',
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

// Fetch Locations ✅
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
		const locations: App.ILocationInfo[] = [];
		for (let location of data.locations) {
			const sr = serializeResponse<App.ILocationInfo, ILocationInfo>(location, {
				ID: '_id',
				Area: 'area',
				City: 'city',
				State: 'state',
			});
			locations.push(sr);
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
// save user info ✅
export async function saveUserInfo(params: ISaveUserInfoParams) {
	try {
		const $APP = get(APP);
		const headers = {
			'Content-Type': 'application/json',
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
			TotalStorageValue: 'totalStorageValue',
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
		addNotice('Profile Updated Successfully.');
		return userInfo;
	} catch (e) {
		const message = (e as Error).message || 'Unkown error';
		addError(message, 5);
		console.error(message);
	}
}

// Fetch Locations ✅
export async function getSubscriptionsList() {
	interface IBenifitsInfo {
		totalStorageValue: number;
		freeWashValue: number;
		freeDryCleanValue: number;
		freeLogisticValue: number;
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
		benifits: IBenifitsInfo;
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
				Benifits: (s) =>
					serializeResponse<App.IBenifitsInfo, IBenifitsInfo>(s.benifits, {
						StorageValue: 'totalStorageValue',
						WashValue: 'freeWashValue',
						DryCleanValue: 'freeDryCleanValue',
						LogisticValue: 'freeLogisticValue',
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

// save user info ✅
export async function buySubscription(subscriptionId: string) {
	interface ISubscriptionResponseFromServer {
		gatewayEntityId: string;
	}
	try {
		const $APP = get(APP);
		const params = {
			subscriptionId,
		};
		const headers = {
			'Content-Type': 'application/json',
			...(await fetchAuthHeadrs($APP)),
		};
		const requestOptions = {
			method: 'POST',
			headers,
			body: JSON.stringify(params),
		};
		const res = await fetch(`${env.PUBLIC_ADMIN_URL}/secure/subscriptions/buy`, requestOptions);
		const jsonResp: IServerResponse<ISubscriptionResponseFromServer> = await res.json();
		if (!jsonResp || typeof jsonResp !== 'object') throw Error('Server error. Not an object. ⛔️');
		if (res.status !== 200 && 'message' in jsonResp && typeof jsonResp.message === 'string') throw Error(jsonResp.message);
		if (!('data' in jsonResp) || typeof jsonResp.data !== 'object' || !jsonResp.data) throw Error('Server error. ⛔️');
		const data = jsonResp.data;
		const paymentGatewayEntityId = data.gatewayEntityId;
		return { paymentGatewayEntityId };
	} catch (e) {
		const message = (e as Error).message || 'Unkown error';
		addError(message, 5);
		console.error(message);
	}
}

interface IActivateSubscriptionParams {
	gatewayEntityId: string;
	paymentId: string;
	signature: string;
}
export async function activateSubscription(params: IActivateSubscriptionParams) {
	try {
		const $APP = get(APP);
		const headers = {
			'Content-Type': 'application/json',
			...(await fetchAuthHeadrs($APP)),
		};
		const requestOptions = {
			method: 'PUT',
			headers,
			body: JSON.stringify(params),
		};
		const res = await fetch(`${env.PUBLIC_ADMIN_URL}/secure/subscriptions/activate`, requestOptions);
		const jsonResp: IServerResponse<IUserInfo> = await res.json();
		if (!jsonResp || typeof jsonResp !== 'object') throw Error('Server error. Not an object. ⛔️');
		if (res.status !== 200 && 'message' in jsonResp && typeof jsonResp.message === 'string') throw Error(jsonResp.message);
		if (!('data' in jsonResp) || typeof jsonResp.data !== 'object' || !jsonResp.data) throw Error('Server error. ⛔️');
		const data = jsonResp.data;
		const userInfo = serializeResponse<App.IUserInfo, IUserInfo>(data, {
			Phone: 'phone',
			UserRole: 'user_role',
			StorageValue: 'storageValue',
			TotalStorageValue: 'totalStorageValue',
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

interface IPriceFromServer {
	currency: string;
	basePrice: number;
	discount: number;
	discountReason: string;
	taxes: number;
	total: number;
}
interface IArticleInfo {
	_id: string;
	name: string;
	category: string;
	images: string[];
	price?: number;
	status?: string;
}
interface IOrdersInfo {
	_id: string;
	locationId: string;
	userId: string;
	type: string; // TODO can we convert this to enum
	status: string; // TODO can we convert this to enum
	completionTimeSlotStart: string;
	completionTimeSlotEnd: string;
	noOfArticles: number;
	price: IPriceFromServer;
	currency: string;
	articles: IArticleInfo[]; // TODO change this later
	paymentId: string;
	createdAt: string;
}
// fetch orders list ✅
export async function getOrdersList() {
	interface IOrdersInfoFromServer {
		orders: IOrdersInfo[];
	}
	try {
		const $APP = get(APP);
		const headers = {
			'Content-Type': 'application/json',
			...(await fetchAuthHeadrs($APP)),
		};
		const requestOptions = {
			method: 'GET',
			headers,
		};
		const res = await fetch(`${env.PUBLIC_ADMIN_URL}/secure/orders`, requestOptions);
		const jsonResp: IServerResponse<IOrdersInfoFromServer> = await res.json();
		if (!jsonResp || typeof jsonResp !== 'object') throw Error('Server error. Not an object. ⛔️');
		if (res.status !== 200 && 'message' in jsonResp && typeof jsonResp.message === 'string') throw Error(jsonResp.message);
		if (!('data' in jsonResp) || typeof jsonResp.data !== 'object' || !jsonResp.data) throw Error('Server error. ⛔️');
		const data = jsonResp.data as IOrdersInfoFromServer;
		const orders: Record<string, App.IOrdersInfo> = {};
		if (!data.orders) return;

		for (let order of data.orders) {
			orders[order._id] = serializeResponse<App.IOrdersInfo, IOrdersInfo>(order, {
				ID: '_id',
				LocationID: 'locationId',
				UserID: 'userId',
				Type: 'type',
				Status: 'status',
				CompletionTimeSlotStart: 'completionTimeSlotStart',
				CompletionTimeSlotEnd: 'completionTimeSlotEnd',
				NoOfArticles: 'noOfArticles',
				Currency: 'currency',
				Articles: (p) => {
					const articlesArray = [];
					for (let article of p.articles) {
						const s = serializeResponse<App.IArticleInfo, IArticleInfo>(article, {
							ID: '_id',
							Name: 'name',
							Category: 'category',
							Images: 'images',
							Price: 'price',
						});
						articlesArray.push(s);
					}
					return articlesArray;
				},
				PaymentID: 'paymentId',
				CreatedAt: 'createdAt',
				Price: (p) =>
					serializeResponse<App.IPriceInfo, IPriceFromServer>(p.price, {
						Currency: 'currency',
						BasePrice: 'basePrice',
						Discount: 'discount',
						DiscountReason: 'discountReason',
						Taxes: 'taxes',
						Total: 'total',
					}),
			});
		}
		return orders;
	} catch (e) {
		const message = (e as Error).message || 'Unkown error';
		addError(message, 5);
		console.error(message);
	}
}

interface IPlaceOrdersParams {
	type: string; // TODO can we make this enum
	noOfArticles: number;
	completionTimeSlotStart: number;
	completionTimeSlotEnd: number;
}
// place pickup orders and fetch price ✅
export async function placeOrderAndFetchPrice(params: IPlaceOrdersParams) {
	try {
		const $APP = get(APP);

		const headers = {
			'Content-Type': 'application/json',
			...(await fetchAuthHeadrs($APP)),
		};
		const requestOptions = {
			method: 'POST',
			headers,
			body: JSON.stringify(params),
		};
		const res = await fetch(`${env.PUBLIC_ADMIN_URL}/secure/orders`, requestOptions);
		const jsonResp: IServerResponse<IOrdersInfo> = await res.json();
		if (!jsonResp || typeof jsonResp !== 'object') throw Error('Server error. Not an object. ⛔️');
		if (res.status !== 200 && 'message' in jsonResp && typeof jsonResp.message === 'string') throw Error(jsonResp.message);
		if (!('data' in jsonResp) || typeof jsonResp.data !== 'object' || !jsonResp.data) throw Error('Server error. ⛔️');
		const data = jsonResp.data as IOrdersInfo;
		const serializedResp = serializeResponse<App.IOrdersInfo, IOrdersInfo>(data, {
			ID: '_id',
			LocationID: 'locationId',
			UserID: 'userId',
			Type: 'type',
			Status: 'status',
			CompletionTimeSlotStart: 'completionTimeSlotStart',
			CompletionTimeSlotEnd: 'completionTimeSlotEnd',
			NoOfArticles: 'noOfArticles',
			Currency: 'currency',
			Articles: (p) => {
				const articlesArray = [];
				for (let article of p.articles) {
					const s = serializeResponse<App.IArticleInfo, IArticleInfo>(article, {
						ID: '_id',
						Name: 'name',
						Category: 'category',
						Images: 'images',
						Price: 'price',
					});
					articlesArray.push(s);
				}
				return articlesArray;
			},
			PaymentID: 'paymentId',
			CreatedAt: 'createdAt',
			Price: (p) =>
				serializeResponse<App.IPriceInfo, IPriceFromServer>(p.price, {
					Currency: 'currency',
					BasePrice: 'basePrice',
					Discount: 'discount',
					DiscountReason: 'discountReason',
					Taxes: 'taxes',
					Total: 'total',
				}),
		});
		addNotice('Order Placed Successfully.');
		return serializedResp;
	} catch (e) {
		const message = (e as Error).message || 'Unkown error';
		addError(message, 5);
		console.error(message);
	}
}

export async function getArticles() {
	interface IArticlesInfoFromServer {
		articles: IArticleInfo[];
	}
	try {
		const $APP = get(APP);
		const headers = {
			'Content-Type': 'application/json',
			...(await fetchAuthHeadrs($APP)),
		};
		const requestOptions = {
			method: 'GET',
			headers,
		};
		const res = await fetch(`${env.PUBLIC_ADMIN_URL}/secure/articles`, requestOptions);
		const jsonResp: IServerResponse<IArticlesInfoFromServer> = await res.json();
		if (!jsonResp || typeof jsonResp !== 'object') throw Error('Server error. Not an object. ⛔️');
		if (res.status !== 200 && 'message' in jsonResp && typeof jsonResp.message === 'string') throw Error(jsonResp.message);
		if (!('data' in jsonResp) || typeof jsonResp.data !== 'object' || !jsonResp.data) throw Error('Server error. ⛔️');
		const data = jsonResp.data as IArticlesInfoFromServer;
		const articles: Record<string, App.IArticleInfo> = {};
		if (!data.articles) return;

		for (let article of data.articles) {
			articles[article._id] = serializeResponse<App.IArticleInfo, IArticleInfo>(article, {
				ID: '_id',
				Status: 'status',
				Name: 'name',
				Category: 'category',
				Images: 'images',
			});
		}
		return articles;
	} catch (e) {
		const message = (e as Error).message || 'Unkown error';
		addError(message, 5);
		console.error(message);
	}
}
