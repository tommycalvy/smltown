import type { UpdateLoginFlowBody, LoginFlow } from '@ory/kratos-client';
import type { Actions, PageServerLoad } from './$types';
import { auth } from '$lib/server/auth';
import { error, redirect } from '@sveltejs/kit';
import { SetCookies } from '$lib/utils';
import { modifyAction } from '$lib/server/auth';
import { fail } from "@sveltejs/kit";

export const load = (async ({ locals, request, url, cookies }) => {
	const refresh = url.searchParams.get('refresh') === 'true' ? true : false;
	

	if (!refresh) {
		if (locals.userSession) {
			console.log('User detected. Redirecting to /');
			throw redirect(303, '/');
		}
	}
	const aal = url.searchParams.get('aal') ?? undefined;
	const returnTo = url.searchParams.get('returnTo') ?? undefined;
	const flowId = url.searchParams.get('flow') ?? undefined;
	const cookie = request.headers.get('cookie') ?? undefined;

	if (!flowId) {
		return await auth.createBrowserLoginFlow({ refresh, aal, returnTo, cookie }).then(
			({ headers, data }) => {
				SetCookies(headers['set-cookie'], { cookies });
				data.ui.action = modifyAction('/login?', data.ui.action);
				return {
					ui: data.ui
				};
			},
			({ response }) => {
				const err = 'Error with createBrowserLoginFlow';
				console.log(err);
				console.log(response);
				throw error(500, 'Error with login');
			}
		);
	}

	return await auth
		.getLoginFlow({
			id: flowId,
			cookie
		})
		.then(
			({ headers, data }) => {
				SetCookies(headers['set-cookie'], {cookies});
				data.ui.action = modifyAction('/login?', data.ui.action);
				return {
					ui: data.ui
				};
			},
			({ response }) => {
				console.log('Status: ', response.status);
				console.log(response.data);
				if (response.status === 403) {
					throw redirect(303, '/login');
				}
				const err = 'Error with getLoginFlow';
				console.log(err);
				console.log(response);
				throw error(500, 'Error with login');
			}
		);
}) satisfies PageServerLoad;

export const actions = {
	default: async ({ request, url, cookies }) => {
		// TODO log the user in
		console.log('login/+page.server.ts default action ran');
		const flowId = url.searchParams.get('flow') ?? undefined;
		if (typeof flowId !== 'string') {
			const err = new Error('No flow id');
			console.log(err);
			throw error(400, 'No flow id');
		}

		const values = await request.formData();
		const method = values.get('auth_method') ?? undefined;

		if (typeof method !== 'string') {
			const err = new Error('No method attribute in post body');
			console.log(err);
			throw error(400, 'No method attribute in post body');
		}

		const csrf_token = values.get('csrf_token') ?? undefined;
		let flowBody: UpdateLoginFlowBody;

		if (method === 'oidc') {
			const provider = values.get('provider') ?? undefined;
			if (typeof provider === 'string' && typeof csrf_token === 'string') {
				flowBody = {
					csrf_token,
					provider,
					method
				};
			} else {
				const err = new Error('Incorrect form data for oidc method');
				console.log(err);
				throw error(400, 'Incorrect Login');
			}
		} else if (method === 'password') {
			const identifier = values.get('identifier') ?? undefined;
			const password = values.get('password') ?? undefined;
			if (
				typeof identifier === 'string' &&
				typeof password === 'string' &&
				typeof csrf_token === 'string'
			) {
				flowBody = {
					csrf_token,
					identifier,
					password,
					method
				};
			} else {
				throw error(400, 'Incorrect form data');
			}
		} else {
			const err = new Error('Login method not supported');
			console.log(err);
			throw error(400, 'Incorrect Login');
		}

		let cookie = request.headers.get('cookie') ?? undefined;
		if (cookie) cookie = decodeURIComponent(cookie);

		return await auth
			.updateLoginFlow({
				flow: flowId,
				updateLoginFlowBody: flowBody,
				cookie: cookie
			})
			.then(
				({ headers }) => {

					SetCookies(headers['set-cookie'], { cookies });

					if (headers['location']) {
						throw redirect(302, headers['location']);
					} else {
						throw redirect(302, '/');
					}
				},
				({ response: { data } }) => {
					console.log(data);
					if (isLoginFlow(data)) {
						return fail(400, {
							ui: data.ui
						});
					} 
					
				}
			);
	}
} satisfies Actions;


const isLoginFlow = (response: object): response is LoginFlow => {
	return (response as LoginFlow).ui !== undefined
}
