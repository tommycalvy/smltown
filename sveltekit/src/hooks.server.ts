import type { Handle } from '@sveltejs/kit';
import { isTheme } from '$lib/types';

export const handle = (async ({ event, resolve }) => {
	const theme = event.cookies.get('theme');

	if (theme != undefined && isTheme(theme)) {
        event.locals.theme = theme;
		const response = await resolve(event, {
			transformPageChunk: ({ html }) => html.replace('data-theme=""', `data-theme="${theme}"`)
		});
		return response;
	}
    event.locals.theme = 'dark';
	const response = await resolve(event, {
		transformPageChunk: ({ html }) => html.replace('data-theme=""', `data-theme="dark"`)
	});
	return response;
}) satisfies Handle;
