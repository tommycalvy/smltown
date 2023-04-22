import { writable, derived } from 'svelte/store';
import type { GeolocationCoords } from "svelte-geolocation/types/Geolocation.svelte";

export const coords = writable<GeolocationCoords>([-1, -1]);

export const latitude = derived(
	coords,
	$coords => $coords[1]
);

export const longitude = derived(
	coords,
	$coords => $coords[0]
);