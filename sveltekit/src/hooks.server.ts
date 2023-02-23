import type { Handle } from '@sveltejs/kit';
import { isTheme } from '$lib/types';
import { auth } from '$lib/auth';

export const handle = (async ({ event, resolve }) => {
	const cookieEncoded = event.request.headers.get('cookie') ?? undefined;
	if (cookieEncoded) {
		const cookie = decodeURIComponent(cookieEncoded);
		const {
			data: { identity }
		} = await auth.toSession({ cookie });
		event.locals.user = {
			id: identity.id,
			email: identity.traits.email,
			name: identity.traits.name.first,
			verified: identity.verifiable_addresses?.[0].verified ?? false,
			color: identity.traits.color
		};
	} else {
		event.locals.user = undefined;
	}

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
