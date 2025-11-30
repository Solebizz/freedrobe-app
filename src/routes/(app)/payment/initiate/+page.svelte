<script lang="ts">
	import { goto } from '$app/navigation';
	import { env } from '$env/dynamic/public';
	import { APP } from '$lib/stores/appMain';
	import { addError, addNotice, type NoticeWithoutMeta } from '$lib/stores/notices';
	import { activateSubscription, cofirmOrder } from '$lib/utils/apis';
	import { entityName, logoFullSrc } from '$lib/utils/globals';

	const state = history.state;
	const amount = state['sveltekit:states'].amount * 100;
	const paymentGatewayEntityId = state['sveltekit:states']?.paymentGatewayEntityId;
	const referrer = state['sveltekit:states']?.referrer;
	const orderUnderscoreId = state['sveltekit:states']?.orderUnderscoreId;

	let orderOptions = { order_id: paymentGatewayEntityId };

	const options = {
		key: env.PUBLIC_RAZORPAY_KEY_ID,
		amount,
		currency: 'INR',
		...orderOptions,
		description: entityName,
		image: logoFullSrc,
		prefill: {
			contact: $APP.User?.Phone,
		},
		webview_intent: true,
		handler: async function (response: App.IRazorpayResponse) {
			switch (referrer) {
				case 'orders/pickup':
				case 'basket': {
					if (!response || !response.razorpay_payment_id || !response.razorpay_signature || !response.razorpay_order_id) {
						addError('Payment failed. Try again.');
						return goto(`/${referrer}`, { replaceState: true });
					}
					const params = {
						signature: response.razorpay_signature,
						paymentId: response.razorpay_payment_id,
						orderId: orderUnderscoreId,
					};
					const confirm_resp = await cofirmOrder(params);
					if (!confirm_resp) {
						addError('Something went wrong. Please try again after sometime', 10);
						return goto('/orders', { replaceState: true });
					}

					const noticeObj: NoticeWithoutMeta = {
						type: 'info',
						msg: 'Order placed successfully..',
						snooze: 5,
					};
					addNotice(noticeObj);
					$APP.ArticlesInBag = [];
					if (referrer === 'basket') $APP.ArticlesInBag = [];

					return goto('/orders', { replaceState: true });
				}
				default: {
					if (!response || !response.razorpay_payment_id || !response.razorpay_signature || !response.razorpay_order_id) {
						addError('Payment failed. Try again.');
						return goto(referrer === 'onboarding_subscription' ? '/onboarding/subscription' : '/subscription-list');
					}
					const params = {
						gatewayEntityId: response.razorpay_order_id,
						paymentId: response.razorpay_payment_id,
						signature: response.razorpay_signature,
					};
					const userInfo = await activateSubscription(params);
					if (!userInfo) {
						addError('Unable to get the user. Please try again after sometime.');
						return goto(referrer === 'onboarding_subscription' ? '/onboarding/subscription' : '/subscription-list', { replaceState: true });
					}

					const noticeObj: NoticeWithoutMeta = {
						type: 'success',
						msg: referrer === 'onboarding_subscription' ? 'Welcome! Your subscription is now active.' : 'Subscription bought.',
						snooze: 5,
					};
					addNotice(noticeObj);
					$APP.User = userInfo;
					goto('/profile', { replaceState: true });
				}
			}
		},
		modal: {
			ondismiss: function () {
				switch (referrer) {
					case 'basket': {
						goto('/orders');
						break;
					}
					case 'onboarding_subscription': {
						goto('/onboarding/subscription');
						break;
					}
					default: {
						goto('/subscription-list');
					}
				}
			},
		},
	};

	const rzp1 = new Razorpay(options);
	rzp1.open();
</script>
