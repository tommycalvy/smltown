import type { LayoutServerLoad } from './$types';
import { auth, modifyAction } from '$lib/server/auth';
import { SetCookies } from '$lib/utils';

export const load = (async ({ locals, cookies, request }) => {
	if (locals.user) {
		return {
			theme: locals.theme,
			user: locals.user,
			loginUi: undefined,
			signupUi: undefined
		};
	}
	const requestCookies = request.headers.get('cookie') ?? undefined;
	const createLoginFlow = auth.createBrowserLoginFlow({ cookie: requestCookies});
	const createSignupFlow = auth.createBrowserRegistrationFlow();

	return Promise.all([createLoginFlow, createSignupFlow]).then(([{ data: loginData, headers }, { data: signupData }]) => {
		
		SetCookies(headers['set-cookie'], cookies);
		loginData.ui.action = modifyAction(`/login?flow=${loginData.id}&`, loginData.ui.action);
		signupData.ui.action = modifyAction(`/signup?flow=${signupData.id}&`, signupData.ui.action);

		return {
			theme: locals.theme,
			user: undefined,
			loginUi: loginData.ui,
			signupUi: signupData.ui
		};

	}, ({ response }) => {
		const err = 'Error with createLoginFlow or createRegistrationFlow';
		console.log(err);
		console.log(response);
	})
	/*
	const requestCookies = request.headers.get('cookie') ?? undefined;
	return await auth
		.createBrowserLoginFlow({ cookie: requestCookies })
		.then(
			({ headers, data }) => {
				SetCookies(headers['set-cookie'], cookies);

				data.ui.action = modifyAction(`/login?flow=${data.id}&`, data.ui.action);
			},
			({ response }) => {
				const err = 'Error with createBrowserLoginFlow';
				console.log(err);
				console.log(response);
				throw error(500, 'Error with login');
			}
		)
		.then(() => auth.createBrowserRegistrationFlow())
		.then(
			({ data }) => {
				data.ui.action = modifyAction(`/signup?flow=${data.id}&`, data.ui.action);
				return {
					theme: locals.theme,
					user: undefined,
					loginUi: loginData.data.ui,
					signupUi: signupData.data.ui
				};
			},
			({ response }) => {
				const err = 'Error with createBrowserLoginFlow';
				console.log(err);
				console.log(response);
				throw error(500, 'Error with login');
			}
		);
		*/
}) satisfies LayoutServerLoad;
