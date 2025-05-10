// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
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
		interface ISubscriptionInfo {
			ID: string;
			Title: string;
			Description: string;
			Features: string[];
			Price: number;
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
			razorpay_subscription_id: string;
			razorpay_order_id: string;
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
			PaymentGatewayID: string;
		}
		interface IData {
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
