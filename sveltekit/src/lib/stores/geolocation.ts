import { writable, derived } from 'svelte/store';

export const coords = writable<[longitude: number, latitude: number]>([-1, -1]);

export const latitude = derived(
	coords,
	$coords => $coords[1]
);

export const longitude = derived(
	coords,
	$coords => $coords[0]
);