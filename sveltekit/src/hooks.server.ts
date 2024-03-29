import type { Handle } from '@sveltejs/kit';
import { isTheme } from '$lib/types';
import { auth } from '$lib/server/auth';

export const handle = (async ({ event, resolve }) => {
	const cookieEncoded = event.request.headers.get('cookie') ?? undefined;
	if (cookieEncoded) {
		const cookie = decodeURIComponent(cookieEncoded);
		await auth.toSession({ cookie }).then(
			({ data: { identity } }) => {
				event.locals.userSession = {
					id: identity.id,
					username: identity.traits.username,
					email: identity.traits.email,
					verified: identity.verifiable_addresses?.[0].verified ?? false,
					admin: identity.metadata_public?.admin ?? false
				};
			},
			({ response }) => {
				event.locals.userSession = undefined;
				if (response.status === 401) {
					console.log('User has cookies but is not authenticated');
				} else {
					const err = new Error('Error with ory toSession call');
					console.log(err);
					console.log(response);
				}
			}
		);
	} else {
		event.locals.userSession = undefined;
	}

	//Set longitude
	const longitudeCookie = event.cookies.get('longitude') ?? "-1.000";
	const longitude = parseFloat(longitudeCookie);
	if (!isNaN(longitude) && longitude >= -180 && longitude <= 180) {
		event.locals.longitude = longitude.toFixed(3);
	} else {
		event.locals.longitude = "-1.0000";
	}

	//Set latitude
	const latitudeCookie = event.cookies.get('latitude') ?? "-1.000";
	const latitude = parseFloat(latitudeCookie);
	if (!isNaN(latitude) && latitude >= -90 && latitude <= 90) {
		event.locals.latitude = latitude.toFixed(3);
	} else {
		event.locals.latitude = "-1.000";
	}

	//Set post slider range
	const rangeInputCookie = event.cookies.get('rangeInput') ?? '814';
	const rangeInput = parseInt(rangeInputCookie);
	if (!isNaN(rangeInput) && rangeInput >= 5 && rangeInput <= 1000) {
		event.locals.rangeInput = rangeInput;
	} else {
		event.locals.rangeInput = 1984;
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

process.on('SIGINT', function () { process.exit(); }); // Ctrl+C  
process.on('SIGTERM', function () { process.exit(); }); // docker stop
