import type { Handle } from '@sveltejs/kit';
import { isTheme } from '$lib/types';
import { auth } from '$lib/server/auth';

export const handle = (async ({ event, resolve }) => {
	const cookieEncoded = event.request.headers.get('cookie') ?? undefined;
	if (cookieEncoded) {
		const cookie = decodeURIComponent(cookieEncoded);
		await auth.toSession({ cookie }).then(({ data: { identity }}) => {
			event.locals.user = {
				id: identity.id,
				username: identity.traits.username,
				email: identity.traits.email,
				verified: identity.verifiable_addresses?.[0].verified ?? false,
			};
		},
		({ response }) => {
			event.locals.user = undefined;
			if (response.status === 401) {
				console.log('User has cookies but is not authenticated');
			} else {
				const err = new Error('Error with ory toSession call');
				console.log(err);
				console.log(response);
			}
		});
	} else {
		console.log('User has no cookie and is therefore not authenticated');
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
