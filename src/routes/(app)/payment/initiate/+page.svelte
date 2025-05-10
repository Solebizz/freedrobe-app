<script lang="ts">
	import { goto } from '$app/navigation';
	import { env } from '$env/dynamic/public';
	import { APP } from '$lib/stores/appMain';
	import { addError, addNotice } from '$lib/stores/notices';
	import { activateSubscription, cofirmOrder } from '$lib/utils/apis';
	import { entityName, logoFullSrc } from '$lib/utils/globals';

	const state = history.state;
	const amount = state['sveltekit:states'].amount * 100;
	const paymentGatewayEntityId = state['sveltekit:states']?.paymentGatewayEntityId;
	const referrer = state['sveltekit:states']?.referrer;
	const orderId = state['sveltekit:states']?.orderId;
	const orderUnderscoreId = state['sveltekit:states']?.orderUnderscoreId;

	let orderOptions = {};
	switch (referrer) {
		case 'basket': {
			orderOptions = { order_id: orderId };
			break;
		}
		default: {
			orderOptions = { subscription_id: paymentGatewayEntityId };
		}
	}

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
		config: {
			display: {
				blocks: {
					utib: {
						name: 'Pay Using Axis Bank',
						instruments: [
							{
								method: 'card',
								issuers: ['UTIB'],
							},
							{
								method: 'netbanking',
								banks: ['UTIB'],
							},
						],
					},
					other: {
						name: 'Other Payment Methods',
						instruments: [
							{
								method: 'card',
								issuers: ['ICIC'],
							},
							{
								method: 'netbanking',
							},
						],
					},
				},
				hide: [
					{
						method: 'upi',
					},
				],
				sequence: ['block.utib', 'block.other'],
				preferences: {
					show_default_blocks: false, // Should Checkout show its default blocks?
				},
			},
		},
		handler: async function (response: App.IRazorpayResponse) {
			switch (referrer) {
				case 'basket': {
					if (!response || !response.razorpay_payment_id || !response.razorpay_signature || !response.razorpay_order_id) {
						addError('Payment failed. Try again.');
						return goto('/basket');
					}
					const params = {
						signature: response.razorpay_signature,
						paymentId: response.razorpay_payment_id,
						orderId: orderUnderscoreId,
					};
					const confirm_resp = await cofirmOrder(params);
					if (!confirm_resp) {
						addError('Something went wrong. Please try again after sometime', 10);
						return goto('/basket');
					}

					addNotice('Order placed successfully.');
					$APP.ArticlesInBag = [];
					return goto('/orders');
				}
				default: {
					if (!response || !response.razorpay_payment_id || !response.razorpay_signature || !response.razorpay_subscription_id) {
						addError('Payment failed. Try again.');
						return goto('/subscription-list');
					}
					const params = {
						gatewayEntityId: response.razorpay_subscription_id,
						paymentId: response.razorpay_payment_id,
						signature: response.razorpay_signature,
					};
					const userInfo = await activateSubscription(params);
					if (!userInfo) {
						addError('Unable to get the user. Please try again after sometime.');
						return goto('/subscription-list');
					}

					addNotice('Subscription bought.');
					$APP.User = userInfo;
					goto('/profile');
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
