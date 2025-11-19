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
		const text = event.clipboardData?.getData('text')?.trim() || '';

		if (!/^\d+$/.test(text)) return;

		const digits = text.split('').slice(0, length);

		digits.forEach((d, i) => {
			boxes[i] = d;
			const el = document.querySelector<HTMLInputElement>(`.otp-input-${i}`);
			if (el) el.value = d;
		});

		focusInput(digits.length - 1);
		onChange(boxes.join(''));
	}

	function focusInput(i: number) {
		document.querySelector<HTMLInputElement>(`.otp-input-${i}`)?.focus();
	}
</script>

<div class="otp-input-container">
	{#each boxes as digit, i}
		<input
			class="otp-input otp-input-{i}"
			maxlength="1"
			inputmode="numeric"
			autocomplete="one-time-code"
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
