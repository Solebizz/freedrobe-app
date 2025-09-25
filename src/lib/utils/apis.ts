import { env } from '$env/dynamic/public';
import { APP } from '$lib/stores/appMain';
import { addError, addNotice, type NoticeWithoutMeta } from '$lib/stores/notices';
import { get } from 'svelte/store';
import { fetchAuthHeadrs, serializeResponse } from './globals';

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
		const jsonResp: Api.IServerResponse<IOTP> = await res.json();
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

// Verify OTP and get user info ✅
export async function verifyOTPAndGetUserInfo(params: Api.IVerifyOTPParams) {
	const { sessionId, otp } = params;

	interface IVerifyOTPReponseFromServer extends Api.IAuthInfo {
		user: Api.IUserInfo;
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
		const jsonResp: Api.IServerResponse<IVerifyOTPReponseFromServer> = await res.json();
		if (!jsonResp || typeof jsonResp !== 'object') throw Error('Server error. Not an object. ⛔️');
		if (res.status !== 200 && 'message' in jsonResp && typeof jsonResp.message === 'string') throw Error(jsonResp.message);
		if (!('data' in jsonResp) || typeof jsonResp.data !== 'object' || !jsonResp.data) throw Error('Server error. ⛔️');
		const data = jsonResp.data as IVerifyOTPReponseFromServer;
		const authInfo = serializeResponse<App.IAuthInfo, Api.IAuthInfo>(data, {
			AuthToken: 'authToken',
			AuthTokenExpiryAt: 'authTokenExpiryAt',
			RefreshToken: 'refreshToken',
			RefershTokenExpiryAt: 'refershTokenExpiryAt',
		});
		const userInfo = serializeResponse<App.IUserInfo, Api.IUserInfo>(data.user, {
			Phone: 'phone',
			UserRole: 'user_role',
			StorageValue: 'storageValue',
			TotalStorageValue: 'totalStorageValue',
			WashValue: 'freeWashValue',
			DryCleanValue: 'freeDryCleanValue',
			LogisticValue: 'freeLogisticValue',
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
				return serializeResponse<App.IAddressInfo, Api.IAddressInfo>(u.address, {
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
			SubscriptionName: 'subscriptionName',
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
		const jsonResp: Api.IServerResponse<ILocationsInfoFromServer> = await res.json();
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

// save user info ✅
export async function saveUserInfo(params: Api.ISaveUserInfoParams) {
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
		const jsonResp: Api.IServerResponse<Api.IUserInfo> = await res.json();
		if (!jsonResp || typeof jsonResp !== 'object') throw Error('Server error. Not an object. ⛔️');
		if (res.status !== 200 && 'message' in jsonResp && typeof jsonResp.message === 'string') throw Error(jsonResp.message);
		if (!('data' in jsonResp) || typeof jsonResp.data !== 'object' || !jsonResp.data) throw Error('Server error. ⛔️');
		const data = jsonResp.data as Api.IUserInfo;
		const userInfo = serializeResponse<App.IUserInfo, Api.IUserInfo>(data, {
			Phone: 'phone',
			UserRole: 'user_role',
			StorageValue: 'storageValue',
			TotalStorageValue: 'totalStorageValue',
			WashValue: 'freeWashValue',
			DryCleanValue: 'freeDryCleanValue',
			LogisticValue: 'freeLogisticValue',
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
				return serializeResponse<App.IAddressInfo, Api.IAddressInfo>(d.address, {
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
			SubscriptionName: 'subscriptionName',
		});
		return userInfo;
	} catch (e) {
		const message = (e as Error).message || 'Unkown error';
		addError(message, 5);
		console.error(message);
	}
}

// Fetch Locations ✅
export async function getSubscriptionsList(protection = false) {
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
		displayPrice: number;
		currency: string;
		currentlySubscribed: number;
		private: boolean;
		paymentCycle: string;
		validity: string;
		deleted: boolean;
		benifits: IBenifitsInfo;
	}
	interface IProtectionPlan {
		_id: string;
		title: string;
		description: string;
		displayPrice: number;
	}
	interface ISubscriptionsInfoFromServer {
		subscriptions: ISubscriptionInfo[] | IProtectionPlan[];
	}

	try {
		const requestOptions = {
			method: 'GET',
		};
		const res = await fetch(`${env.PUBLIC_ADMIN_URL}/public/subscriptions${protection ? '?filter={"protection": "true"}' : ''}`, requestOptions);
		const jsonResp: Api.IServerResponse<ISubscriptionsInfoFromServer> = await res.json();
		if (!jsonResp || typeof jsonResp !== 'object') throw Error('Server error. Not an object. ⛔️');
		if (res.status !== 200 && 'message' in jsonResp && typeof jsonResp.message === 'string') throw Error(jsonResp.message);
		if (!('data' in jsonResp) || typeof jsonResp.data !== 'object' || !jsonResp.data) throw Error('Server error. ⛔️');
		const data = jsonResp.data as ISubscriptionsInfoFromServer;
		const subscriptions: Record<string, App.ISubscriptionInfo | App.IProtectionPlanInfo> = {};
		if (!protection) {
			for (let subscription of data.subscriptions) {
				subscriptions[subscription._id] = serializeResponse<App.ISubscriptionInfo, Partial<ISubscriptionInfo>>(subscription, {
					ID: '_id',
					Title: 'title',
					Description: 'description',
					Features: 'features',
					Price: 'displayPrice',
					Currency: 'currency',
					CurrentlySubscribed: 'currentlySubscribed',
					Private: 'private',
					PaymentCycle: 'paymentCycle',
					Validity: 'validity',
					Deleted: 'deleted',
					Benifits: (s) => {
						if (!s.benifits) return {};
						return serializeResponse<App.IBenifitsInfo, IBenifitsInfo>(s.benifits, {
							StorageValue: 'totalStorageValue',
							WashValue: 'freeWashValue',
							DryCleanValue: 'freeDryCleanValue',
							LogisticValue: 'freeLogisticValue',
						});
					},
				});
			}
		} else {
			for (let subscription of data.subscriptions) {
				subscriptions[subscription._id] = serializeResponse<App.IProtectionPlanInfo, IProtectionPlan>(subscription, {
					ID: '_id',
					Title: 'title',
					Description: 'description',
					Price: 'displayPrice',
				});
			}
		}
		return subscriptions;
	} catch (e) {
		const message = (e as Error).message || 'Unkown error';
		addError(message, 5);
		console.error(message);
	}
}

// save user info ✅
export async function buySubscription(params: Api.IBuySubscriptionParams) {
	interface IPriceBreakUp {
		subscription: number;
		discountPercent: number;
		discountValue: number;
		protectionPlan: number;
	}
	interface ISubscriptionOrderResponseFromServer {
		gatewayEntityId: string;
		amount: number;
		details: IPriceBreakUp;
	}
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
		const res = await fetch(`${env.PUBLIC_ADMIN_URL}/secure/subscriptions/buy`, requestOptions);
		const jsonResp: Api.IServerResponse<ISubscriptionOrderResponseFromServer> = await res.json();
		if (!jsonResp || typeof jsonResp !== 'object') throw Error('Server error. Not an object. ⛔️');
		if (res.status !== 200 && 'message' in jsonResp && typeof jsonResp.message === 'string') throw Error(jsonResp.message);
		if (!('data' in jsonResp) || typeof jsonResp.data !== 'object' || !jsonResp.data) throw Error('Server error. ⛔️');
		const data = jsonResp.data;

		const subscriptionOrderInfo = serializeResponse<App.ISubscriptionOrderInfo, ISubscriptionOrderResponseFromServer>(data, {
			GatewayEntityId: 'gatewayEntityId',
			Total: 'amount',
			PriceBreakup: (s) => {
				if (!s.details) return {};
				return serializeResponse<App.IPriceBreakUp, IPriceBreakUp>(s.details, {
					SubscriptionAmount: 'subscription',
					DiscountPercent: 'discountPercent',
					DiscountAmount: 'discountValue',
					ProtectionPlanAmount: 'protectionPlan',
				});
			},
		});

		return { subscriptionOrderInfo };
	} catch (e) {
		const message = (e as Error).message || 'Unkown error';
		addError(message, 5);
		console.error(message);
	}
}

// activate subscription ✅
export async function activateSubscription(params: Api.IActivateSubscriptionParams) {
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
		const jsonResp: Api.IServerResponse<Api.IUserInfo> = await res.json();
		if (!jsonResp || typeof jsonResp !== 'object') throw Error('Server error. Not an object. ⛔️');
		if (res.status !== 200 && 'message' in jsonResp && typeof jsonResp.message === 'string') throw Error(jsonResp.message);
		if (!('data' in jsonResp) || typeof jsonResp.data !== 'object' || !jsonResp.data) throw Error('Server error. ⛔️');
		const data = jsonResp.data;
		const userInfo = serializeResponse<App.IUserInfo, Api.IUserInfo>(data, {
			Phone: 'phone',
			UserRole: 'user_role',
			StorageValue: 'storageValue',
			TotalStorageValue: 'totalStorageValue',
			WashValue: 'freeWashValue',
			DryCleanValue: 'freeDryCleanValue',
			LogisticValue: 'freeLogisticValue',
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
				return serializeResponse<App.IAddressInfo, Api.IAddressInfo>(d.address, {
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
			SubscriptionName: 'subscriptionName',
		});
		return userInfo;
	} catch (e) {
		const message = (e as Error).message || 'Unkown error';
		addError(message, 5);
		console.error(message);
	}
}

// fetch orders list ✅
export async function getOrdersList(params: Api.IPaginatedParams) {
	interface IOrdersInfoFromServer {
		orders: Api.IOrdersInfo[];
		count: number;
	}
	try {
		const { limit, start } = params;
		let url = `${env.PUBLIC_ADMIN_URL}/secure/orders`;
		const $APP = get(APP);
		const userRole = $APP.User?.UserRole || 'endUser';
		const isLogisticsOrAdmin = ['logistics', 'admin'].includes(userRole);

		if (isLogisticsOrAdmin) {
			url = `${env.PUBLIC_ADMIN_URL}/secure/orders/staff`;
		}
		url += `?limit=${limit}&startIndex=${start}`;
		const headers = {
			'Content-Type': 'application/json',
			...(await fetchAuthHeadrs($APP)),
		};
		const requestOptions = {
			method: 'GET',
			headers,
		};
		const res = await fetch(url, requestOptions);
		const jsonResp: Api.IServerResponse<IOrdersInfoFromServer> = await res.json();
		if (!jsonResp || typeof jsonResp !== 'object') throw Error('Server error. Not an object. ⛔️');
		if (res.status !== 200 && 'message' in jsonResp && typeof jsonResp.message === 'string') throw Error(jsonResp.message);
		if (!('data' in jsonResp) || typeof jsonResp.data !== 'object' || !jsonResp.data) throw Error('Server error. ⛔️');
		const data = jsonResp.data as IOrdersInfoFromServer;
		const orders: Record<string, App.IOrdersInfo> = {};
		if (!data.orders) return {};

		for (let order of data.orders) {
			orders[order._id] = serializeResponse<App.IOrdersInfo, Api.IOrdersInfo>(order, {
				ID: '_id',
				LocationID: 'locationId',
				UserID: 'userId',
				Type: 'type',
				Status: 'status',
				CompletionTimeSlotStart: 'completionTimeSlotStart',
				CompletionTimeSlotEnd: 'completionTimeSlotEnd',
				NoOfArticles: 'noOfArticles',
				Currency: 'currency',
				ConfirmationCode: 'confirmationCode',
				Articles: (p) => {
					const articlesArray = [];
					for (let article of p.articles) {
						const s = serializeResponse<App.IArticleInfo, Api.IArticleInfo>(article, {
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
				ReceiptID: 'receiptId',
				Price: (p) =>
					serializeResponse<App.IPriceInfo, Api.IPriceFromServer>(p.price, {
						Currency: 'currency',
						BasePrice: 'basePrice',
						Discount: 'discount',
						DiscountReason: 'discountReason',
						Taxes: 'taxes',
						Total: 'total',
					}),
				UserInfo: (o) => {
					if (!o.userInfo) return {};

					return serializeResponse<Partial<App.IUserInfo>, Api.IOrdersUserInfo>(o.userInfo, {
						Phone: 'phone',
						Name: 'name',
						Address: (u) => {
							const defaults = {
								Line1: '',
								Line2: '',
							};
							if (!u.address) return defaults;
							return serializeResponse<App.IAddressInfo, Api.IAddressInfo>(u.address, {
								Line1: 'line1',
								Line2: 'line2',
							});
						},
					});
				},
			});
		}
		const count = data.count;
		return { orders, count };
	} catch (e) {
		const message = (e as Error).message || 'Unkown error';
		addError(message, 5);
		console.error(message);
	}
}

// fetch order details by ID ⚠️
export async function getOrderDetailsByID(id: string) {
	try {
		let url = `${env.PUBLIC_ADMIN_URL}/secure/orders/${id}`;
		const $APP = get(APP);
		const userRole = $APP.User?.UserRole || 'endUser';
		const isLogisticsOrAdmin = ['logistics', 'admin'].includes(userRole);

		if (isLogisticsOrAdmin) {
			url = `${env.PUBLIC_ADMIN_URL}/secure/orders/staff/${id}`;
		}
		const headers = {
			'Content-Type': 'application/json',
			...(await fetchAuthHeadrs($APP)),
		};
		const requestOptions = {
			method: 'GET',
			headers,
		};
		const res = await fetch(url, requestOptions);
		const jsonResp: Api.IServerResponse<Api.IOrdersInfo> = await res.json();
		if (!jsonResp || typeof jsonResp !== 'object') throw Error('Server error. Not an object. ⛔️');
		if (res.status !== 200 && 'message' in jsonResp && typeof jsonResp.message === 'string') throw Error(jsonResp.message);
		if (!('data' in jsonResp) || typeof jsonResp.data !== 'object' || !jsonResp.data) throw Error('Server error. ⛔️');
		const data = jsonResp.data as Api.IOrdersInfo;
		if (!data) return {};

		const resp = serializeResponse<App.IOrdersInfo, Api.IOrdersInfo>(data, {
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
					const s = serializeResponse<App.IArticleInfo, Api.IArticleInfo>(article, {
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
			ReceiptID: 'receiptId',
			Price: (p) =>
				serializeResponse<App.IPriceInfo, Api.IPriceFromServer>(p.price, {
					Currency: 'currency',
					BasePrice: 'basePrice',
					Discount: 'discount',
					DiscountReason: 'discountReason',
					Taxes: 'taxes',
					Total: 'total',
				}),
			UserInfo: (o) => {
				if (!o.userInfo) return {};

				return serializeResponse<Partial<App.IUserInfo>, Api.IOrdersUserInfo>(o.userInfo, {
					Phone: 'phone',
					Name: 'name',
					Address: (u) => {
						const defaults = {
							Line1: '',
							Line2: '',
						};
						if (!u.address) return defaults;
						return serializeResponse<App.IAddressInfo, Api.IAddressInfo>(u.address, {
							Line1: 'line1',
							Line2: 'line2',
						});
					},
				});
			},
		});
		return resp;
	} catch (e) {
		const message = (e as Error).message || 'Unkown error';
		addError(message, 5);
		console.error(message);
	}
}

// place pickup orders and fetch price ✅
export async function placeOrderAndFetchPrice(params: Api.IPlaceOrdersParams) {
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
		const jsonResp: Api.IServerResponse<Api.IOrdersInfo> = await res.json();
		if (!jsonResp || typeof jsonResp !== 'object') throw Error('Server error. Not an object. ⛔️');
		if (res.status !== 200 && 'message' in jsonResp && typeof jsonResp.message === 'string') throw Error(jsonResp.message);
		if (!('data' in jsonResp) || typeof jsonResp.data !== 'object' || !jsonResp.data) throw Error('Server error. ⛔️');
		const data = jsonResp.data as Api.IOrdersInfo;
		const serializedResp = serializeResponse<App.IOrdersInfo, Api.IOrdersInfo>(data, {
			ID: '_id',
			LocationID: 'locationId',
			UserID: 'userId',
			Type: 'type',
			Status: 'status',
			CompletionTimeSlotStart: 'completionTimeSlotStart',
			CompletionTimeSlotEnd: 'completionTimeSlotEnd',
			NoOfArticles: 'noOfArticles',
			Currency: 'currency',
			ReceiptID: 'receiptId',
			Articles: (p) => {
				const articlesArray = [];
				for (let article of p.articles) {
					const s = serializeResponse<App.IArticleInfo, Api.IArticleInfo>(article, {
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
			PaymentGatewayID: 'paymentGatewayId',
			PaymentID: 'paymentId',
			CreatedAt: 'createdAt',
			Price: (p) =>
				serializeResponse<App.IPriceInfo, Api.IPriceFromServer>(p.price, {
					Currency: 'currency',
					BasePrice: 'basePrice',
					Discount: 'discount',
					DiscountReason: 'discountReason',
					Taxes: 'taxes',
					Total: 'total',
				}),
		});
		return serializedResp;
	} catch (e) {
		const message = (e as Error).message || 'Unkown error';
		addError(message, 5);
		console.error(message);
	}
}

// get articles info ✅
export async function getArticles(params: Api.IPaginatedParams) {
	interface IArticlesInfoFromServer {
		articles: Api.IArticleInfo[];
		count: number;
	}
	try {
		const { limit = 25, start = 0 } = params;
		const $APP = get(APP);
		const headers = {
			'Content-Type': 'application/json',
			...(await fetchAuthHeadrs($APP)),
		};
		const requestOptions = {
			method: 'GET',
			headers,
		};
		const res = await fetch(`${env.PUBLIC_ADMIN_URL}/secure/articles?limit=${limit}&startIndex=${start}`, requestOptions);
		const jsonResp: Api.IServerResponse<IArticlesInfoFromServer> = await res.json();
		if (!jsonResp || typeof jsonResp !== 'object') throw Error('Server error. Not an object. ⛔️');
		if (res.status !== 200 && 'message' in jsonResp && typeof jsonResp.message === 'string') throw Error(jsonResp.message);
		if (!('data' in jsonResp) || typeof jsonResp.data !== 'object' || !jsonResp.data) throw Error('Server error. ⛔️');
		const data = jsonResp.data as IArticlesInfoFromServer;
		const articles: Record<string, App.IArticleInfo> = {};
		if (!data.articles) return;

		for (let article of data.articles) {
			articles[article._id] = serializeResponse<App.IArticleInfo, Api.IArticleInfo>(article, {
				ID: '_id',
				Status: 'status',
				Name: 'name',
				Category: 'category',
				Images: 'images',
			});
		}
		const count = data.count;
		return { articles, count };
	} catch (e) {
		const message = (e as Error).message || 'Unkown error';
		addError(message, 5);
		console.error(message);
	}
}

// confirm order ✅
export async function cofirmOrder(params: Api.IConfirmOrderParams) {
	const { paymentId, signature, orderId } = params;
	try {
		const $APP = get(APP);
		const paramsForResquest = {
			paymentId,
			signature,
		};
		const headers = {
			'Content-Type': 'application/json',
			...(await fetchAuthHeadrs($APP)),
		};
		const requestOptions = {
			method: 'PUT',
			headers,
			body: JSON.stringify(paramsForResquest),
		};
		const res = await fetch(`${env.PUBLIC_ADMIN_URL}/secure/orders/${orderId}`, requestOptions);
		const jsonResp: Api.IServerResponse<Api.IOrdersInfo> = await res.json();
		if (!jsonResp || typeof jsonResp !== 'object') throw Error('Server error. Not an object. ⛔️');
		if (res.status !== 200 && 'message' in jsonResp && typeof jsonResp.message === 'string') throw Error(jsonResp.message);
		if (!('data' in jsonResp) || typeof jsonResp.data !== 'object' || !jsonResp.data) throw Error('Server error. ⛔️');
		return true;
	} catch (e) {
		const message = (e as Error).message || 'Unkown error';
		addError(message, 5);
		console.error(message);
	}
}

//  confirm order ✅
export async function cancelOrder(params: Api.ICancelOrderParams) {
	const { orderId } = params;
	try {
		const $APP = get(APP);
		const headers = {
			'Content-Type': 'application/json',
			...(await fetchAuthHeadrs($APP)),
		};
		const requestOptions = {
			method: 'PATCH',
			headers,
		};
		const res = await fetch(`${env.PUBLIC_ADMIN_URL}/secure/orders/${orderId}`, requestOptions);
		const jsonResp: Api.IServerResponse<Api.IOrdersInfo> = await res.json();
		if (!jsonResp || typeof jsonResp !== 'object') throw Error('Server error. Not an object. ⛔️');
		if (res.status !== 200 && 'message' in jsonResp && typeof jsonResp.message === 'string') throw Error(jsonResp.message);
		if (!('data' in jsonResp) || typeof jsonResp.data !== 'object' || !jsonResp.data) throw Error('Server error. ⛔️');
		return true;
	} catch (e) {
		const message = (e as Error).message || 'Unkown error';
		addError(message, 5);
		console.error(message);
	}
}

// get user info ✅
export async function getUserInfo() {
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
		const res = await fetch(`${env.PUBLIC_ADMIN_URL}/secure/users`, requestOptions);
		const jsonResp: Api.IServerResponse<Api.IUserInfo> = await res.json();
		if (!jsonResp || typeof jsonResp !== 'object') throw Error('Server error. Not an object. ⛔️');
		if (res.status !== 200 && 'message' in jsonResp && typeof jsonResp.message === 'string') throw Error(jsonResp.message);
		if (!('data' in jsonResp) || typeof jsonResp.data !== 'object' || !jsonResp.data) throw Error('Server error. ⛔️');
		const data = jsonResp.data as Api.IUserInfo;

		const userInfo = serializeResponse<App.IUserInfo, Api.IUserInfo>(data, {
			Phone: 'phone',
			UserRole: 'user_role',
			StorageValue: 'storageValue',
			TotalStorageValue: 'totalStorageValue',
			WashValue: 'freeWashValue',
			DryCleanValue: 'freeDryCleanValue',
			LogisticValue: 'freeLogisticValue',
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
				return serializeResponse<App.IAddressInfo, Api.IAddressInfo>(u.address, {
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
			SubscriptionName: 'subscriptionName',
		});
		return { userInfo };
	} catch (e) {
		const message = (e as Error).message || 'Unkown error';
		addError(message, 5);
		console.error(message);
	}
}

// check if coupon and get details ✅
export async function fetchCouponInfo(text: string) {
	interface ICouponInfo {
		_id: string;
		code: string;
		description: string;
		discount: number;
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
		const res = await fetch(`${env.PUBLIC_ADMIN_URL}/secure/coupons/${text}`, requestOptions);
		const jsonResp: Api.IServerResponse<ICouponInfo> = await res.json();
		if (!jsonResp || typeof jsonResp !== 'object') throw Error('Server error. Not an object. ⛔️');
		if (res.status !== 200 && 'message' in jsonResp && typeof jsonResp.message === 'string') throw Error(jsonResp.message);
		if (!('data' in jsonResp) || typeof jsonResp.data !== 'object' || !jsonResp.data) throw Error('Server error. ⛔️');
		const data = jsonResp.data as ICouponInfo;

		const discountInfo = serializeResponse<App.ICouopnInfo, ICouponInfo>(data, {
			ID: '_id',
			Code: 'code',
			Description: 'description',
			Discount: 'discount',
		});
		return { discountInfo };
	} catch (e) {
		const message = (e as Error).message || 'Unkown error';
		addError(message, 5);
		console.error(message);
	}
}

// get prices for each category ✅
export async function fetchPrices(type: string) {
	interface IPricesInfo {
		_id: string;
		category: string;
		price: number;
	}
	interface IPricesResponseFromServer {
		prices: IPricesInfo[];
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
		const res = await fetch(`${env.PUBLIC_ADMIN_URL}/secure/prices?filter={"type": "${type}"}`, requestOptions);
		const jsonResp: Api.IServerResponse<IPricesResponseFromServer> = await res.json();
		if (!jsonResp || typeof jsonResp !== 'object') throw Error('Server error. Not an object. ⛔️');
		if (res.status !== 200 && 'message' in jsonResp && typeof jsonResp.message === 'string') throw Error(jsonResp.message);
		if (!('data' in jsonResp) || typeof jsonResp.data !== 'object' || !jsonResp.data) throw Error('Server error. ⛔️');
		const data = jsonResp.data as IPricesResponseFromServer;
		let pricesInfo: Record<string, App.IPricesInfo> = {};
		for (let price of data.prices) {
			pricesInfo[price._id] = serializeResponse<App.IPricesInfo, IPricesInfo>(price, {
				Category: 'category',
				Price: 'price',
			});
		}
		return { pricesInfo };
	} catch (e) {
		const message = (e as Error).message || 'Unkown error';
		addError(message, 5);
		console.error(message);
	}
}

// change order status to done or cancelled ✅
export async function changeOrderStatus(params: Api.IChangeOrderStatusParams) {
	const { otp, orderId, noOfArticles = 0 } = params;
	try {
		const $APP = get(APP);
		const headers = {
			'Content-Type': 'application/json',
			...(await fetchAuthHeadrs($APP)),
		};
		const body = {
			confirmationCode: otp,
			noOfArticles,
		};
		const requestOptions = {
			method: 'PUT',
			headers,
			body: JSON.stringify(body),
		};
		const res = await fetch(`${env.PUBLIC_ADMIN_URL}/secure/orders/logistics/${orderId}`, requestOptions);
		const jsonResp: Api.IServerResponse<Api.IUserInfo> = await res.json();
		if (!jsonResp || typeof jsonResp !== 'object') throw Error('Server error. Not an object. ⛔️');
		if (res.status !== 200 && 'message' in jsonResp && typeof jsonResp.message === 'string') throw Error(jsonResp.message);
		if (!('data' in jsonResp) || typeof jsonResp.data !== 'object' || !jsonResp.data) throw Error('Server error. ⛔️');
		const noticeObj: NoticeWithoutMeta = {
			type: 'info',
			msg: 'OTP Confirmed',
			snooze: 5,
		};
		addNotice(noticeObj);
		return true;
	} catch (e) {
		const message = (e as Error).message || 'Unkown error';
		addError(message, 5);
		console.error(message);
	}
}

// start uploading image ✅
export async function uploadImage(file: File) {
	try {
		interface IUploadInfo {
			_id: string;
			uploadProgress: number;
		}
		const $APP = get(APP);
		const headers = {
			...(await fetchAuthHeadrs($APP)),
		};
		const formData = new FormData();
		formData.append('file', file);
		const requestOptions = {
			method: 'POST',
			headers,
			body: formData,
		};
		const res = await fetch(`${env.PUBLIC_ADMIN_URL}/secure/uploads`, requestOptions);
		const jsonResp: Api.IServerResponse<IUploadInfo> = await res.json();
		if (!jsonResp || typeof jsonResp !== 'object') throw Error('Server error. Not an object. ⛔️');
		if (res.status !== 200 && 'message' in jsonResp && typeof jsonResp.message === 'string') throw Error(jsonResp.message);
		if (!('data' in jsonResp) || typeof jsonResp.data !== 'object' || !jsonResp.data) throw Error('Server error. ⛔️');

		const data = jsonResp.data;
		return data._id;
	} catch (e) {
		const message = (e as Error).message || 'Unkown error';
		addError(message, 5);
		console.error(message);
	}
}

// get image upload progress ✅
export async function getUploadProgress(id: string) {
	try {
		interface IUploadInfo {
			_id: string;
			uploadProgress: number;
			url?: string;
		}
		const $APP = get(APP);
		const headers = {
			'Content-Type': 'application/json',
			...(await fetchAuthHeadrs($APP)),
		};
		const requestOptions = {
			method: 'GET',
			headers,
		};
		const res = await fetch(`${env.PUBLIC_ADMIN_URL}/secure/uploads/${id}`, requestOptions);
		const jsonResp: Api.IServerResponse<IUploadInfo> = await res.json();
		if (!jsonResp || typeof jsonResp !== 'object') throw Error('Server error. Not an object. ⛔️');
		if (res.status !== 200 && 'message' in jsonResp && typeof jsonResp.message === 'string') throw Error(jsonResp.message);
		if (!('data' in jsonResp) || typeof jsonResp.data !== 'object' || !jsonResp.data) throw Error('Server error. ⛔️');

		const data = jsonResp.data;
		const resp = {
			ID: data._id,
			UploadProgress: data.uploadProgress,
			URL: data.url,
		};
		return resp;
	} catch (e) {
		const message = (e as Error).message || 'Unkown error';
		addError(message, 5);
		console.error(message);
	}
}

// complete order ✅
export async function completeOrder(params: Api.ICompleteOrderPrams) {
	const { items, orderId } = params;
	try {
		const $APP = get(APP);
		const headers = {
			'Content-Type': 'application/json',
			...(await fetchAuthHeadrs($APP)),
		};
		const body = {
			items,
		};
		const requestOptions = {
			method: 'PUT',
			headers,
			body: JSON.stringify(body),
		};
		const res = await fetch(`${env.PUBLIC_ADMIN_URL}/secure/orders/admin/${orderId}`, requestOptions);
		const jsonResp: Api.IServerResponse<Api.IUserInfo> = await res.json();
		if (!jsonResp || typeof jsonResp !== 'object') throw Error('Server error. Not an object. ⛔️');
		if (res.status !== 200 && 'message' in jsonResp && typeof jsonResp.message === 'string') throw Error(jsonResp.message);
		if (!('data' in jsonResp) || typeof jsonResp.data !== 'object' || !jsonResp.data) throw Error('Server error. ⛔️');
		const noticeObj: NoticeWithoutMeta = {
			type: 'info',
			msg: 'Articles added successfully.',
			snooze: 5,
		};
		addNotice(noticeObj);
		return true;
	} catch (e) {
		const message = (e as Error).message || 'Unkown error';
		addError(message, 5);
		console.error(message);
	}
}

// get all the user with active subscription ✅
export async function fetchUsersWithActiveSubscription(params: Api.IPaginatedParams) {
	try {
		interface IServerUserInfo {
			user: Api.IUserInfo[];
			count: number;
		}
		const { limit, start } = params;
		const $APP = get(APP);
		const headers = {
			'Content-Type': 'application/json',
			...(await fetchAuthHeadrs($APP)),
		};
		const requestOptions = {
			method: 'GET',
			headers,
		};
		const res = await fetch(`${env.PUBLIC_ADMIN_URL}/secure/users/admin?filter={"activeSubscription":true}&limit=${limit}&startIndex=${start}`, requestOptions);
		const jsonResp: Api.IServerResponse<IServerUserInfo> = await res.json();
		if (!jsonResp || typeof jsonResp !== 'object') throw Error('Server error. Not an object. ⛔️');
		if (res.status !== 200 && 'message' in jsonResp && typeof jsonResp.message === 'string') throw Error(jsonResp.message);
		if (!('data' in jsonResp) || typeof jsonResp.data !== 'object' || !jsonResp.data) throw Error('Server error. ⛔️');
		const data = jsonResp.data.user;

		const users: App.IUserInfo[] = [];
		data.forEach((user) => {
			const userInfo = serializeResponse<App.IUserInfo, Api.IUserInfo>(user, {
				Phone: 'phone',
				UserRole: 'user_role',
				StorageValue: 'storageValue',
				TotalStorageValue: 'totalStorageValue',
				WashValue: 'freeWashValue',
				DryCleanValue: 'freeDryCleanValue',
				LogisticValue: 'freeLogisticValue',
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
					return serializeResponse<App.IAddressInfo, Api.IAddressInfo>(d.address, {
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
				SubscriptionName: 'subscriptionName',
			});
			users.push(userInfo);
		});
		const count = jsonResp.data.count || 0;
		return { users, count };
	} catch (e) {
		const message = (e as Error).message || 'Unkown error';
		addError(message, 5);
		console.error(message);
	}
}

// fetch and update token from the server ✅
export async function fetchAndUpdateToken() {
	try {
		const $APP = get(APP);
		const authToken = $APP.Auth?.AuthToken || '';
		const refreshToken = $APP.Auth?.RefreshToken || '';

		const tokenHeaders = {
			authToken,
			refreshToken,
		};
		const headers = {
			'Content-Type': 'application/json',
			...tokenHeaders,
		};
		const requestOptions = {
			method: 'GET',
			headers,
		};
		const res = await fetch(`${env.PUBLIC_ADMIN_URL}/public/users/refresh-token/`, requestOptions);
		const jsonResp: Api.IServerResponse<Api.IAuthInfo> = await res.json();
		if (!jsonResp || typeof jsonResp !== 'object') throw Error('Server error. Not an object. ⛔️');
		if (res.status !== 200 && 'message' in jsonResp && typeof jsonResp.message === 'string') throw Error(jsonResp.message);
		if (!('data' in jsonResp) || typeof jsonResp.data !== 'object' || !jsonResp.data) throw Error('Server error. ⛔️');
		const auth = jsonResp.data;

		const resp = serializeResponse<App.IAuthInfo, Api.IAuthInfo>(auth, {
			AuthToken: 'authToken',
			RefreshToken: 'refreshToken',
			AuthTokenExpiryAt: 'authTokenExpiryAt',
			RefershTokenExpiryAt: 'refershTokenExpiryAt',
		});
		return resp;
	} catch (e) {
		const message = (e as Error).message || 'Unkown error';
		addError(message, 5);
		console.error(message);
	}
}
