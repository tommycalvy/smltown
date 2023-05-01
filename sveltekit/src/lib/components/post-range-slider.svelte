<script lang="ts">
	import type { WithTarget } from '$lib/types';
	import {latitude, longitude } from '$lib/stores/geolocation';

	export let rangeInput = 814;

	let form: HTMLFormElement;

	$: postRange = Math.floor(Math.pow(rangeInput / 100, 4.1) + 0.1 * rangeInput + 5);
	// Submit the form on change of the input
	async function onChange(event: WithTarget<Event, HTMLInputElement>) {
		document.cookie = `rangeInput=${rangeInput};max-age=31536000;path="/";samesite=strict;secure`;
		document.cookie = `latitude=${$latitude.toFixed(3)};max-age=3600;path="/";samesite=strict;secure`;
		document.cookie = `longitude=${$longitude.toFixed(3)};max-age=3600;path="/";samesite=strict;secure`;
		form.submit();
	}
</script>



<form
	action="?/getPosts"
	method="POST"
	enctype="application/x-www-form-urlencoded"
	class="flex gap-3 w-full bg-base-100 group rounded-md p-4"
	bind:this={form}
>
	<input type="hidden" name="latitude" bind:value={$latitude} />
	<input type="hidden" name="longitude" bind:value={$longitude} />
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
		/>
		<div class="flex justify-between">
			<output for="rangeInput" class="w-12">{postRange}</output>
			<output for="rangeInput">mi</output>
		</div>
	</div>
</form>
