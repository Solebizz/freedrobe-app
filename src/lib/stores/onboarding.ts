import { writable } from 'svelte/store';

export const onboardingStep = writable({
	currentStep: 0,
	completedSteps: [] as number[],
});

export const subscriptionSkipped = writable(false);

export function setOnboardingStep(step: number) {
	onboardingStep.set({
		currentStep: step,
		completedSteps: step === 1 ? [] : step === 2 ? [1] : step === 3 ? [1, 2] : [],
	});
}

export function resetOnboardingStep() {
	onboardingStep.set({
		currentStep: 0,
		completedSteps: [],
	});
}

export function setSubscriptionSkipped(skipped: boolean) {
	subscriptionSkipped.set(skipped);
}

export function resetSubscriptionSkipped() {
	subscriptionSkipped.set(false);
}
