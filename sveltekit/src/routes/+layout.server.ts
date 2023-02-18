import type { LayoutServerLoad } from './$types';

export const load = (async (event) => {
    console.log('Theme: ', event.locals.theme);
	return {
		theme: event.locals.theme
	};
}) satisfies LayoutServerLoad;
