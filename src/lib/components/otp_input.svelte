<script lang="ts">
	export let length: number = 6;
	export let value: string = '';
	export let onChange: (otp: string) => void;

	let boxes = Array(length).fill('');

	$: if (value && value.length === length) {
		boxes = value.split('');
	}

	function handleInput(index: number, event: Event) {
		const input = event.target as HTMLInputElement;
		let v = input.value.replace(/\D/g, '');

		// Handle autocomplete or paste that fills entire OTP in first field
		if (v.length > 1) {
			fillOTP(v);
			return;
		}

		if (!v) {
			boxes[index] = '';
			onChange(boxes.join(''));
			return;
		}

		boxes[index] = v[0];
		input.value = v[0];

		if (index < length - 1) focusInput(index + 1);

		onChange(boxes.join(''));
	}

	function handleKeydown(index: number, event: KeyboardEvent) {
		if (event.key === 'Backspace' && !boxes[index] && index > 0) {
			focusInput(index - 1);
		}
	}

	function handlePaste(event: ClipboardEvent) {
		event.preventDefault();
		const text = event.clipboardData?.getData('text')?.trim() || '';
		const digits = text.replace(/\D/g, '');

		if (!digits) return;

		fillOTP(digits);
	}

	function fillOTP(digits: string) {
		const digitArray = digits.split('').slice(0, length);

		digitArray.forEach((d, i) => {
			boxes[i] = d;
			const el = document.querySelector<HTMLInputElement>(`.otp-input-${i}`);
			if (el) el.value = d;
		});

		// Fill remaining boxes with empty strings if needed
		for (let i = digitArray.length; i < length; i++) {
			boxes[i] = '';
			const el = document.querySelector<HTMLInputElement>(`.otp-input-${i}`);
			if (el) el.value = '';
		}

		// Focus the last filled input or the last input if all filled
		const focusIndex = Math.min(digitArray.length, length - 1);
		focusInput(focusIndex);

		onChange(boxes.join(''));
	}

	function focusInput(i: number) {
		setTimeout(() => {
			document.querySelector<HTMLInputElement>(`.otp-input-${i}`)?.focus();
		}, 10);
	}
</script>

<div class="otp-input-container">
	{#each boxes as digit, i}
		<input
			class="otp-input otp-input-{i}"
			type="tel"
			maxlength="6"
			inputmode="numeric"
			pattern="[0-9]*"
			autocomplete={i === 0 ? 'one-time-code' : 'off'}
			value={digit}
			on:input={(e) => handleInput(i, e)}
			on:keydown={(e) => handleKeydown(i, e)}
			on:paste={handlePaste} />
	{/each}
</div>

<style>
	.otp-input-container {
		display: flex;
		gap: 8px;
	}

	.otp-input {
		width: 40px;
		height: 45px;
		text-align: center;
		font-size: 22px;
		border: 2px solid #ccc;
		border-radius: 6px;
	}

	.otp-input:focus {
		border-color: #0070f3;
		outline: none;
	}
</style>
