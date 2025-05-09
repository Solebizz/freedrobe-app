<script lang="ts">
	import { goto } from '$app/navigation';
	import { env } from '$env/dynamic/public';
	import { APP } from '$lib/stores/appMain';
	import { addError, addNotice } from '$lib/stores/notices';
	import { activateSubscription } from '$lib/utils/apis';
	import { entityName, logoFullSrc } from '$lib/utils/globals';

	const state = history.state;
	const amount = state['sveltekit:states'].amount * 100;
	const paymentGatewayEntityId = state['sveltekit:states'].paymentGatewayEntityId;

	const options = {
		key: env.PUBLIC_RAZORPAY_KEY_ID,
		amount,
		currency: 'INR',
		subscription_id: paymentGatewayEntityId,
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
		},
		modal: {
			ondismiss: function () {
				goto('/subscription-list');
			},
		},
	};

	const rzp1 = new Razorpay(options);
	rzp1.open();
</script>
