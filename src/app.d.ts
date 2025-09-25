// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace Api {
		interface IAddressInfo {
			line1: string;
			line2: string;
		}
		interface IUserInfo {
			phone: string;
			user_role: string;
			storageValue: number;
			totalStorageValue: number;
			freeWashValue: number;
			freeDryCleanValue: number;
			freeLogisticValue: number;
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
			subscriptionName?: string;
		}
		interface IAuthInfo {
			refreshToken: string;
			authToken: string;
			authTokenExpiryAt: number;
			refershTokenExpiryAt: number;
		}
		interface IServerResponse<T = unknown> {
			status: number;
			success: boolean;
			message: string;
			data: T;
		}
		interface IVerifyOTPParams {
			sessionId: string;
			otp: string;
		}
		interface ISaveUserInfoParams {
			name: string;
			gender: string;
			address: IAddressInfo;
			locationId: string;
		}
		interface IBuySubscriptionParams {
			subscriptionId: string;
			protectionId?: string;
			couponId?: string;
		}
		interface IActivateSubscriptionParams {
			gatewayEntityId: string;
			paymentId: string;
			signature: string;
		}
		interface ICompleteOrderPrams {
			items: Record<string, any>[];
			orderId: string;
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
		interface IOrdersUserInfo {
			phone: string;
			name: string;
			address: {
				line1: string;
				line2: string;
			};
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
			receiptId: string;
			articles: IArticleInfo[]; // TODO change this later
			paymentId: string;
			createdAt: string;
			paymentGatewayId: string;
			confirmationCode: string;
			userInfo?: IOrdersUserInfo;
		}
		interface IPlaceOrdersParams {
			type: string; // TODO can we make this enum
			noOfArticles?: number;
			articles?: string[];
			completionTimeSlotStart?: number;
			completionTimeSlotEnd?: number;
		}
		interface IConfirmOrderParams {
			paymentId?: string;
			signature?: string;
			orderId: string;
		}
		interface ICancelOrderParams {
			orderId: string;
		}
		interface IChangeOrderStatusParams {
			orderId: string;
			otp: number;
			noOfArticles?: number;
		}
		interface IPaginatedParams {
			limit: number;
			start: number;
		}
	}
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
		interface IOTP {
			SessionID: string;
		}
		interface IAddressInfo {
			Line1: string;
			Line2: string;
		}
		interface IUserInfo {
			Phone: string;
			UserRole: string;
			StorageValue: number;
			TotalStorageValue: number;
			WashValue: number;
			DryCleanValue: number;
			LogisticValue: number;
			ActiveSubscription: number;
			Deleted: boolean;
			Blocked: boolean;
			BlockedReason: string;
			Address?: IAddressInfo;
			Gender?: string;
			LocationId?: string;
			Name?: string;
			SubscriptionId?: string;
			SubscriptionValidTill?: string;
			SubscriptionValidityPeriod?: string;
			SubscriptionName?: string;
		}
		interface IAuthInfo {
			RefreshToken: string;
			AuthToken: string;
			AuthTokenExpiryAt: number;
			RefershTokenExpiryAt: number;
		}
		interface ILocationInfo {
			ID: string;
			Area: string;
			City: string;
			State: string;
		}
		interface IBenifitsInfo {
			StorageValue: number;
			WashValue: number;
			DryCleanValue: number;
			LogisticValue: number;
		}

		interface IProtectionPlanInfo {
			ID: string;
			Title: string;
			Description: string;
			Price: string;
		}
		interface ISubscriptionInfo extends IProtectionPlanInfo {
			Features: string[];
			Currency: string;
			CurrentlySubscribed: number;
			Private: boolean;
			PaymentCycle: string;
			Validity: string;
			Deleted: boolean;
			Benifits: IBenifitsInfo;
		}
		interface IPriceInfo {
			Currency: string;
			BasePrice: number;
			Discount: number;
			DiscountReason: string;
			Taxes: number;
			Total: number;
		}
		interface IArticleInfo {
			ID: string;
			Name: string;
			Category: string;
			Images: string[];
			Price?: number;
			Status?: string;
		}
		interface IRazorpayResponse {
			razorpay_payment_id: string;
			razorpay_signature: string;
			razorpay_order_id: string;
		}
		interface IPriceBreakUp {
			SubscriptionAmount: number;
			DiscountPercent: number;
			DiscountAmount: number;
			ProtectionPlanAmount: number;
		}
		interface ISubscriptionOrderInfo {
			GatewayEntityId: string;
			Total: number;
			PriceBreakup: IPriceBreakUp;
		}
		interface IOrdersInfo {
			ID: string;
			LocationID: string;
			UserID: string;
			Type: string; // TODO can we make this an enum
			Status: string; // TODO can we make this an enum
			CompletionTimeSlotStart: string;
			CompletionTimeSlotEnd: string;
			NoOfArticles: number;
			Price: IPriceInfo;
			Currency: string;
			Articles: IArticleInfo[]; // TODO change this later
			PaymentID: string;
			CreatedAt: string;
			ReceiptID: string;
			PaymentGatewayID?: string;
			ConfirmationCode?: string;
			UserInfo?: Partial<IUserInfo>;
		}
		interface ICouopnInfo {
			ID: string;
			Code: string;
			Description: string;
			Discount: number;
		}
		interface IPricesInfo {
			Category: string;
			Price: number;
		}
		interface IData {
			Orders?: Record<string, IOrdersInfo>;
			LoadedFromLocalStorage: boolean;
			Locations?: Record<string, ILocationInfo>;
			Auth?: IAuthInfo;
			User?: IUserInfo;
			Articles?: Record<string, IArticleInfo>;
			ArticlesInBag: string[];
			Staff?: {
				User?: IUserInfo;
				Auth?: IAuthInfo;
			};
		}
	}

	/**
	 * Utility Type that turns specified optional keys into required ones. Also re-maps into a new type so hovering the type in IDE is more meaningful
	 * See linked SO post for further explanation
	 * https://stackoverflow.com/questions/66679911/typescript-typecast-object-so-specific-required-keys-are-no-longer-optional-in-t
	 *
	 */
	type RequireKeys<T extends object, K extends keyof T> = Required<Pick<T, K>> & Omit<T, K> extends infer O ? { [P in keyof O]: O[P] } : never;

	/**
	 * Utility Type that turns specified `K` fields into optional fields and re-maps into a new type for better IDE experience
	 */
	type OptionalKeys<T extends object, K extends keyof T> = Partial<Pick<T, K>> & Omit<T, K> extends infer O ? { [P in keyof O]: O[P] } : never;

	/**
	 * Utility Type that "condenses" complex types into an easier to read version when hovering
	 */
	type Condense<T> = { [K in keyof T]: T[K] };
}

export {};
