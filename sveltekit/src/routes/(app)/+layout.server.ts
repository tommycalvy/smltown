import type { LayoutServerLoad } from './$types';
import { auth, modifyAction } from '$lib/server/auth';
import { SetCookies } from '$lib/utils';
import { error } from '@sveltejs/kit';

export const load = (async ({ locals, cookies, request }) => {
	console.log('(app)/+layout.server.ts load function ran');

	if (locals.user) {
		return {
			theme: locals.theme,
			user: locals.user,
			loginUi: undefined,
			signupUi: undefined
		};
	}
	const requestCookies = request.headers.get('cookie') ?? undefined;
	const createLoginFlow = auth.createBrowserLoginFlow({ cookie: requestCookies });
	const createSignupFlow = auth.createBrowserRegistrationFlow();

	return Promise.all([createLoginFlow, createSignupFlow]).then(
		([{ data: loginData, headers }, { data: signupData }]) => {
			SetCookies(headers['set-cookie'], cookies);
			loginData.ui.action = modifyAction('?/login&', loginData.ui.action);
			signupData.ui.action = modifyAction('?/signup&', signupData.ui.action);

			return {
				theme: locals.theme,
				user: undefined,
				loginUi: loginData.ui,
				signupUi: signupData.ui
			};
		},
		({ response }) => {
			const err = 'Error with createLoginFlow or createRegistrationFlow';
			console.log(err);
			console.log(response);
			throw error(500, 'Internal Error');
		}
	);
}) satisfies LayoutServerLoad;
