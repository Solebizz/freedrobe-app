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
		interface IOrdersInfo {
			ID: string;
			LocationID: string;
			UserID: string;
			Type: string; // TODO can we make this an enum
			Status: string; // TODO can we make this an enum
			CompletionTimeSlotStart: string;
			CompletionTimeSlotEnd: string;
			NoOfArticles: number;
			Price: IPriceInfo[];
			Currency: string;
			Articles: any[]; // TODO change this later
			PaymentID: string;
		}
		interface IData {
			LoadedFromLocalStorage: boolean;
			Locations?: Record<string, ILocationInfo>;
			Auth?: IAuthInfo;
			User?: IUserInfo;
			Staff?: {
				User?: IUserInfo;
				Auth?: IAuthInfo;
			};
		}
	}
}

export {};
