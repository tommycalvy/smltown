<script lang="ts">
	import type { WithTarget } from '$lib/types';
	import Geolocation from 'svelte-geolocation';

	export let rangeInput = 814;
	let coords: [number, number] = [-1, -1];

	let changed = false;
	let form: HTMLFormElement;

	$: postRange = Math.floor(Math.pow(rangeInput / 100, 3.6) + 0.1 * rangeInput + 5);
	// Submit the form on change of the input
	async function onChange(event: WithTarget<Event, HTMLInputElement>) {
		document.cookie = `rangeInput=${rangeInput};max-age=31536000;path="/";samesite=strict;secure`;
		form.submit();
	}

	function onInput(event: WithTarget<Event, HTMLInputElement>) {
		changed = true;
	}
</script>

{#if changed}
	<Geolocation getPosition bind:coords />
{/if}

<form
	action="?/getPosts"
	method="POST"
	enctype="application/x-www-form-urlencoded"
	class="flex gap-3 w-full bg-base-100 group rounded-md p-4"
	bind:this={form}
>
	<input type="hidden" name="latitude" bind:value={coords[1]} />
	<input type="hidden" name="longitude" bind:value={coords[0]} />
	<div class="flex justify-between w-full gap-4">
		<input
			id="rangeInput"
			name="rangeInput"
			type="range"
			min="5"
			max="1000"
			bind:value={rangeInput}
			class="range range-primary"
			on:change={onChange}
			on:input={onInput}
		/>
		<div class="flex justify-between">
			<output for="rangeInput" class="w-11">{postRange}</output>
			<output for="rangeInput">mi</output>
		</div>
	</div>
</form>
