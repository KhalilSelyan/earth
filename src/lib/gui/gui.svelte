<script lang="ts">
	import type { Writable } from 'svelte/store';

	type ControlValue =
		| number
		| boolean
		| string
		| { value: string; options: string[] } // Store both selected value and options
		| { value: number; min: number; max: number; step: number };
	type Controls = Record<string, ControlValue>;
	export let controls: Writable<Controls>;
	const entries = Object.entries($controls);
	const isNotEmpty = entries.length > 0;

	const is = {
		number: (value: ControlValue): value is number => typeof value === 'number',
		boolean: (value: ControlValue): value is boolean => typeof value === 'boolean',
		text: (value: ControlValue): value is string =>
			typeof value === 'string' && !value.startsWith('#'),
		color: (value: ControlValue): value is string =>
			typeof value === 'string' && value.startsWith('#'),
		range: (
			value: ControlValue
		): value is { value: number; min: number; max: number; step: number } =>
			typeof value === 'object' && 'min' in value && 'max' in value && 'step' in value,
		select: (value: ControlValue): value is { options: string[] } =>
			typeof value === 'object' && value !== null && 'options' in value
	};

	function updateControls(e: Event) {
		const target = e.target as HTMLInputElement;
		const { type, dataset, checked } = target;
		const key = dataset.key!;

		controls.update(($controls) => {
			let controlValue = $controls[key];

			switch (type) {
				case 'range':
					if (
						typeof controlValue === 'object' &&
						controlValue !== null &&
						'value' in controlValue
					) {
						if (e.type === 'wheel') {
							const direction = (e as WheelEvent).deltaY < 0 ? 'up' : 'down';

							if (direction === 'up') {
								if (Number(controlValue.value) < +target.max) {
									controlValue.value = Number(controlValue.value) + +target.step;
								}
							} else {
								if (Number(controlValue.value) > +target.min) {
									controlValue.value = Number(controlValue.value) - +target.step;
								}
							}
						} else {
							controlValue.value = +target.value;
						}
					}
					break;

				case 'checkbox':
					if (typeof controlValue === 'boolean') {
						$controls[key] = checked;
					}
					break;

				case 'number':
					if (typeof controlValue === 'number') {
						$controls[key] = +target.value;
					}
					break;

				case 'select-one':
					if (
						type === 'select-one' &&
						typeof controlValue === 'object' &&
						controlValue !== null &&
						'options' in controlValue
					) {
						$controls[key] = { ...controlValue, value: target.value }; // Update the selected value
					}
					break;

				default:
					if (typeof controlValue === 'string') {
						$controls[key] = target.value;
					}
			}

			// Ensure the control value is updated in the store
			return $controls;
		});
	}
</script>

{#if isNotEmpty}
	<div class="gui">
		{#each entries as [label, value]}
			{#if is.number(value)}
				<label>
					{label}
					<input
						on:change={updateControls}
						on:wheel={updateControls}
						value={controls[label]}
						data-key={label}
						type="number"
					/>
				</label>
			{/if}

			{#if is.boolean(value)}
				<label>
					{label}
					<input
						on:change={updateControls}
						data-key={label}
						checked={controls[label]}
						type="checkbox"
					/>
				</label>
			{/if}

			{#if is.text(value)}
				<label>
					{label}
					<input on:input={updateControls} data-key={label} value={controls[label]} type="text" />
				</label>
			{/if}

			{#if is.range(value)}
				<label>
					{label}
					<input
						on:input={updateControls}
						on:wheel={updateControls}
						data-key={label}
						value={value.value}
						min={value.min}
						max={value.max}
						step={value.step}
						type="range"
					/>
				</label>
			{/if}

			{#if is.color(value)}
				<label>
					{label}
					<input on:input={updateControls} value={controls[label]} data-key={label} type="color" />
				</label>
			{/if}

			{#if is.select(value)}
				<label>
					{label}
					<select on:change={updateControls} data-key={label}>
						{#each value.options as option}
							<option value={option} selected={option === value.value}>{option}</option>
						{/each}
					</select>
				</label>
			{/if}
		{/each}
	</div>
{/if}

<style>
	.gui {
		position: absolute;
		top: var(--gui-position-top, 40px);
		right: var(--gui-position-right, 40px);
		bottom: var(--gui-position-bottom);
		left: var(--gui-position-left);
		display: grid;
		gap: 1.5rem;
		padding: 1rem;
		color: var(--gui-txt-clr, hsl(220 10% 80%));
		background-color: var(--gui-bg-clr, hsl(220 10% 14%));
		border: 1px solid hsl(220 10% 18%);
		border-radius: 8px;
		box-shadow: 1px 1px 10px hsl(0 0% 0% / 10%);

		& label {
			display: grid;
			grid-template-columns: repeat(2, 1fr);
			gap: 2rem;
			align-items: center;
			justify-items: start;
			font-weight: 700;

			&:not(:last-child) {
				padding-block-end: 1.5rem;
				border-bottom: 1px solid hsl(220 10% 20%);
			}

			& input:not([type='checkbox']) {
				text-align: center;
				padding-left: 0.25rem;
				padding-right: 0.25rem;
				padding-top: 0.25rem;
				padding-bottom: 0.25rem;
				border-radius: 0.5rem;
			}
		}
	}
</style>
