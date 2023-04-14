<script lang="ts">
	import type { WithTarget } from '$lib/types';
	import Geolocation from 'svelte-geolocation';

    export let postRangeInput = 814;
	let coords: [number, number] = [-1, -1];
    
    let changed = false;

    $: postRange = Math.floor(Math.pow(postRangeInput / 100, 3.6) + 0.1 * postRangeInput + 5);
	
    function onInput(event: WithTarget<Event, HTMLInputElement>) {
        if (event.currentTarget.value !== '') {
            changed = true;
        }
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
>
	<input type="hidden" name="latitude" bind:value={coords[1]} />
	<input type="hidden" name="longitude" bind:value={coords[0]} />
    <div class="flex justify-between w-full gap-4">
        <input id="postRange" name="postRange" type="range" min="5" max="1000" bind:value={postRangeInput} class="range range-primary" on:input={onInput}/>
        <div class="flex justify-between">
            <output for="postRange" class="w-11">{postRange}</output>
            <output for="postRange">mi</output>
        </div>
    </div>
	
</form>
