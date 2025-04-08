<script lang="ts" context="module">
	interface Option {
		label: string;
		value: string;
		disabled?: boolean;
		description?: string;
		checked?: (value: any) => boolean;
	}

	export interface FieldDefinition {
		Label?: string;
		Type?:
			| 'text' // default
			// | 'rich-text'
			| 'checkbox'
			| 'checkboxes'
			| 'color'
			| 'datalist'
			| 'Date'
			| 'DateTime'
			| 'image'
			| 'camera'
			| 'int'
			| 'number'
			| 'phone'
			| 'radio'
			| 'range'
			| 'select'
			| 'textarea'
			| 'time'
			| 'multi-select';
		Size?: 'sm' | 'lg';
		Attributes?: object;
		Edit?: boolean;
		Default?: any;
		Min?: number | string;
		Max?: number | string;
		HTMLAttributes?: HTMLAttributes;
		Span?: number;
		GroupClass?: string;
		Required?: boolean;
		Options?: Option[] | Record<string, any>;
		SubmitOffCheckbox?: true; // if true, then when the checkbox is unchecked, it will submit an empty value
		/**
		 * Html that displays below the input
		 */
		Caption?: string;
		/**
		 * Html that displays to the right of the input
		 */
		Unit?: string;
	}
	export interface Field<T extends Record<string, any> = Record<string, any>> {
		key: keyof T;
		definition: FieldDefinition;
	}
	export type KeyedField<T extends object> = {
		[K in keyof T]?: FieldDefinition;
	};
	export interface HTMLAttributes {
		id?: string;
		name?: string;
		step?: number;
		disabled?: boolean;
		placeholder?: string;
		autocomplete?: 'on' | 'off';
		required?: boolean;
		maxlength?: number;
		style?: string;
	}

	/**
	 * Utility to check if all required fields in an object are valid. However should use $form.checkValidity() in most cases
	 */
	export function canSubmit<T extends Record<string, any> = Record<string, any>>(fields: Field<T>[], item: T): boolean {
		for (let { key, definition } of fields) {
			if (definition.Required) {
				if (!item[key]) return false;
			}
		}
		return true;
	}
</script>

<script lang="ts">
	//TODO: should these be awaited so they don't load if they are not needed?
	// import Editor from '@tinymce/tinymce-svelte';
	import MultiSelectDropdown from './multi_select_dropdown.svelte';
	import FileDropzone from './file_dropzone.svelte';
	import { addError } from '$lib/stores/notices';
	// import ImageInput from './image-input.svelte';

	export let definition: FieldDefinition = {};
	export let key: string;
	export let value: any | undefined;

	//label
	$: label = definition.Label ?? key;
	let attributes: HTMLAttributes = {};
	if (typeof definition.HTMLAttributes === 'object') attributes = definition.HTMLAttributes;
	$: attributes.required = definition.Required;

	if (!attributes.id) attributes.id = 'field-' + key;
	if (!attributes.name) attributes.name = key;

	//Type
	let type: string = definition.Type ?? 'text';
	if (definition.Type === 'DateTime') {
		type = 'datetime-local';

		if (value && typeof value === 'string') value = value.replace(/\s/, 'T');
	}
	if (definition.Type === 'int') {
		type = 'number';
		attributes.step = 1;
	}
	if (definition.Type === 'phone') {
		type = 'phone';
		attributes.step = 1;
	}

	$: attributes.disabled = definition.Edit === false;

	let options: Option[] = [];
	$: {
		// re-run this whenever the definition changes
		if (definition.Options) {
			if (Array.isArray(definition.Options)) {
				options = definition.Options.map((o) => {
					if (typeof o === 'object' && o.label && o.value) {
						return o;
					}
					return { label: o, value: o };
				});
			} else if (typeof options === 'object') {
				options = Object.keys(definition.Options).map((k) => {
					// @ts-ignore definition.Options CANNOT be undefined
					return { value: k, label: definition.Options[k] };
				});
			}
		}
	}

	if (typeof value === 'undefined' && typeof definition.Default !== 'undefined') value = definition.Default;

	// have to do it this way because the type cannot be dynamic by default https://stackoverflow.com/questions/57392773/error-type-attribute-cannot-be-dynamic-if-input-uses-two-way-binding
	const handleInput = (e: Event) => {
		// in here, you can switch on type and implement
		// whatever behavior you need
		let target = e.target as HTMLInputElement;
		if (!target) return;
		switch (type) {
			case 'checkboxes': {
				if (!Array.isArray(value)) value = [];
				if (target.checked) {
					value.push(target.value);
					value = value; // force svelte to update
				} else {
					value = value.filter((v: any) => v !== target.value);
				}
				break;
			}
			case 'number':
			case 'range':
				value = target.value.toString();
				break;
			case 'phone':
				if (value && target.value.length < value.length && (target.value.length === 3 || target.value.length === 7)) {
					// Don't do post-processing they just backspaced one of the dashes
					value = target.value;
				} else {
					let v = target.value.toString();
					v = v.replace(/\D/g, ''); // strip out non-digits
					// if (v.length >= 3) v = v.slice(0, 3) + '-' + v.slice(3); // add the first dash if they have at least 3 digits (eg. 706 -> 706-)
					// if (v.length >= 7) v = v.slice(0, 7) + '-' + v.slice(7); // add the second dash if they have at least 7 digits (eg. 706-399 -> 706-399-)
					if (v.length > 10) v = v.slice(0, 10);
					value = v;
					target.value = v;
				}
				break;
			default:
				value = target.value;
		}
	};

	function handleBlur(e: Event) {
		let target = e.target as HTMLInputElement;
		if (!target) return;
		switch (type) {
			case 'text':
			case 'textarea': {
				if (target.value.length && value.trim() === '') {
					value = target.value = '';
					addError(`Invalid input in <b>${label}</b>.`);
				}
				break;
			}

			// no default
		}
	}

	function getIsChecked(option: Option) {
		if (option.checked) return option.checked(value);
		if (Array.isArray(value)) return option.value in value;
		return value === option;
	}
</script>

<div class="field mb-3 form-group col-md-{definition.Span ?? 12} {definition.GroupClass ?? ''}" data-field-key={key} data-field-type={type}>
	<label for="field-{key}" class="px-2 pb-1">
		{#if type === 'checkbox'}
			<input type="checkbox" bind:checked={value} {value} {...attributes} />
			{#if definition.SubmitOffCheckbox && !value}
				<!-- change default behavior of checkboxes does not submit data if uncheck. -->
				<input type="hidden" name={key} value="" />
			{/if}
		{/if}
		<span>{label}</span>
		{#if attributes.required}
			<span class="text-danger">*</span>
		{/if}
	</label>
	<div class="d-flex align-items-center gap-2">
		<div class="flex-grow-1 w-100">
			{#if type === 'select'}
				<select class="form-select form-select-{definition.Size ?? ''}" on:input={handleInput} {...attributes}>
					<option value="">{attributes.placeholder ?? ''}</option>
					{#each options as option}
						<option value={option.value} selected={option.value === value ? true : null}>{option.label}</option>
					{/each}
				</select>
			{:else if type === 'checkboxes' || type === 'radio'}
				{#each options as option}
					{@const isChecked = getIsChecked(option)}
					<label class="mb-1 d-flex gap-2 align-items-center">
						<input
							type={type === 'checkboxes' ? 'checkbox' : type}
							name={type === 'checkboxes' ? `${key}[]` : key}
							value={option.value}
							checked={isChecked}
							on:input={handleInput}
							class="form-check-input m-0"
							required={attributes.required}
							disabled={attributes.disabled || option.disabled} />
						<span class:opacity-50={attributes.disabled || option.disabled}>{@html option.label}</span>
					</label>
					{#if option?.description}
						<p class="font-in-1">{option.description}</p>
					{/if}
				{/each}
			{:else if type === 'textarea'}
				<textarea class="form-control form-control-{definition.Size ?? ''}" on:blur={handleBlur} on:input={handleInput} {...attributes}>{value ?? ''}</textarea>
			{:else if type === 'multi-select'}
				{#if typeof value == 'undefined' || value === null || Array.isArray(value)}
					<MultiSelectDropdown key="{key}[]" Options={options} bind:selected={value} disabled={attributes.disabled} />
				{/if}
				<!-- {:else if type === 'rich-text'}
				<Editor
					scriptSrc="/public/ext/tinymce/tinymce.min.js"
					bind:value
					conf={{
						plugins: ['lists', 'media', 'link', 'image', 'emoticons'],
						toolbar: 'undo redo | bold italic bullist numlist | link unlink emoticons media',
						menubar: false,
						statusbar: false,
					}} />

				<textarea {value} {...attributes} class="d-none" aria-hidden="true" /> -->
			{:else if type === 'image'}
				<FileDropzone bind:value maxSize={attributes.maxlength} disabled={attributes.disabled} required={attributes.required} returnURL={false} />
				<textarea name={attributes.name} class="d-none" {...attributes}>{value}</textarea>
				<!-- {:else if type === 'camera'}
				<ImageInput required={attributes.required} /> -->
			{:else if type !== 'checkbox'}
				<input
					{type}
					class="form-{type !== 'datalist' ? 'control' : 'select'} form-control-{definition.Size ?? ''}"
					min={definition.Min}
					max={definition.Max}
					value={value ?? ''}
					on:input={handleInput}
					on:blur={handleBlur}
					autocomplete="off"
					list={type === 'datalist' ? attributes.id + '_options' : null}
					{...attributes} />
			{/if}
			{#if type === 'datalist'}
				<datalist id={attributes.id + '_options'}>
					{#each options as option}
						<option value={option.value}>{option.label}</option>
					{/each}
				</datalist>
			{/if}
			{#if attributes.disabled}
				<!-- add a hidden input for disable fields -->
				<input type="hidden" name={key} {value} />
			{/if}
			{#if attributes.maxlength && !type.match(/image/)}
				<div class="maxlength">
					{#if type === 'rich-text'}
						<span class="text-muted">(Includes formatting) </span>
					{/if}
					{value?.length ?? 0}/{attributes.maxlength}
				</div>
			{/if}
		</div>
		{#if definition.Unit}
			<div>{definition.Unit}</div>
		{/if}
	</div>
	{#if definition.Caption}
		<div class="font-in-1 px-2 text-muted">{definition.Caption}</div>
	{/if}
</div>

<style lang="scss">
	.maxlength {
		font-size: 14px;
		font-weight: 400;
		letter-spacing: 0.25px;
		text-align: right;
	}
	label,
	input,
	textarea {
		font-weight: 300; //TODO: figure out if this should be set here or at the theme level
	}
	.field[data-field-type='checkbox'] {
		label {
			display: flex;
			align-items: center;
			gap: 0.5rem;
		}
	}
</style>
