import type { PageServerLoad, Actions } from './$types';
import { error } from '@sveltejs/kit';
import { auth, modifyAction } from '$lib/server/auth';
import type {
	LoginFlow,
	RegistrationFlow,
	UpdateLoginFlowBody,
	UpdateRegistrationFlowBody
} from '@ory/kratos-client';
import { redirect, fail } from '@sveltejs/kit';
import { DeleteCookiesByPrefix, GetCookieByPrefix, SetCookies } from '$lib/utils';

export const load = (async ({ parent }) => {
	const { user } = await parent();
	return {
		user: user,
		title: user + ' - SMLTOWN'
	};
}) satisfies PageServerLoad;

export const actions = {
	login: async ({ request, url, cookies }) => {
		// TODO log the user in
		console.log('(app)/+page.server.ts login action ran');
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

		const cookieHeader = request.headers.get('cookie') ?? undefined;
		const cookie = GetCookieByPrefix(cookieHeader, {
			prefix: 'login_csrf_token',
			remove: 'login_'
		});

		return await auth
			.updateLoginFlow({
				flow: flowId,
				updateLoginFlowBody: flowBody,
				cookie: cookie
			})
			.then(
				({ headers }) => {
					DeleteCookiesByPrefix(cookieHeader, { cookies, prefix: 'signup_csrf_token' });
					DeleteCookiesByPrefix(cookieHeader, { cookies, prefix: 'login_csrf_token' });
					SetCookies(headers['set-cookie'], { cookies });
					if (headers['location']) {
						throw redirect(302, headers['location']);
					} else {
						throw redirect(302, '/');
					}
				},
				({ response: { data, status } }) => {
					console.log('Status: ', status);
					console.log(data);
					if (isLoginFlow(data)) {
						data.ui.action = modifyAction('?/login&', data.ui.action);
						return fail(400, {
							loginUi: data.ui
						});
					} else if (data.use_flow_id) {
						throw redirect(303, `?/login&flow=${data.use_flow_id}`);
					} else if (data.error.id === 'security_csrf_violation') {
						DeleteCookiesByPrefix(cookieHeader, { cookies, prefix: 'csrf_token' });
						throw redirect(303, '?/login');
					}
					throw error(500, 'Internal Error');
				}
			);
	},
	signup: async ({ url, request, cookies }) => {
		const flowId = url.searchParams.get('flow') ?? undefined;
		if (typeof flowId !== 'string') {
			const err = new Error('No flow id');
			console.log(err);
			throw error(500, 'No flow id');
		}

		const values = await request.formData();
		const authMethod = values.get('auth_method') ?? undefined;
		if (typeof authMethod !== 'string') {
			const err = new Error('No method attribute in post body');
			console.log(err);
			throw error(500, 'No method attribute in post body');
		}

		const csrf_token = values.get('csrf_token') ?? undefined;
		let flowBody: UpdateRegistrationFlowBody;

		if (authMethod === 'oidc') {
			const provider = values.get('provider') ?? undefined;
			if (typeof provider === 'string' && typeof csrf_token === 'string') {
				flowBody = {
					csrf_token,
					provider,
					method: authMethod,
					traits: {
						username: values.get('traits.username') ?? undefined,
						email: values.get('traits.email') ?? undefined
					}
				};
			} else {
				const err = new Error('Incorrect form data');
				console.log(err);
				throw error(400, 'Incorrect form data');
			}
		} else if (authMethod === 'password') {
			const password = values.get('password') ?? undefined;
			if (typeof password === 'string' && typeof csrf_token === 'string') {
				flowBody = {
					csrf_token,
					password,
					method: authMethod,
					traits: {
						username: values.get('traits.username') ?? undefined,
						email: values.get('traits.email')
					}
				};
			} else {
				const err = new Error('Incorrect form data');
				console.log(err);
				throw error(400, 'Incorrect form data');
			}
		} else {
			const err = new Error('Registration method not supported');
			console.log(err);
			throw error(400, 'Registration method not supported');
		}

		const cookieHeader = request.headers.get('cookie') ?? undefined;
		const cookie = GetCookieByPrefix(cookieHeader, {
			prefix: 'signup_csrf_token',
			remove: 'signup_'
		});

		return await auth
			.updateRegistrationFlow({
				flow: flowId,
				updateRegistrationFlowBody: flowBody,
				cookie: cookie
			})
			.then(
				({ headers }) => {
					// TODO: Need to set color of default avatar background using ory admin api
					DeleteCookiesByPrefix(cookieHeader, { cookies, prefix: 'signup_csrf_token' });
					DeleteCookiesByPrefix(cookieHeader, { cookies, prefix: 'login_csrf_token' });
					SetCookies(headers['set-cookie'], { cookies });
					if (headers['location']) {
						throw redirect(302, headers['location']);
					} else {
						throw redirect(302, '/');
					}
				},
				({ response: { data, status } }) => {
					console.log('Status: ', status);
					console.log(data);
					if (isRegistrationFlow(data)) {
						data.ui.action = modifyAction('?/signup&', data.ui.action);
						return fail(400, {
							signupUi: data.ui
						});
					} else if (data.use_flow_id) {
						throw redirect(303, `?/signup&flow=${data.use_flow_id}`);
					} else if (data.error.id === 'security_csrf_violation') {
						DeleteCookiesByPrefix(cookieHeader, { cookies, prefix: 'csrf_token' });
						throw redirect(303, '?/signup');
					}
					throw error(500, 'Internal Error');
				}
			);
	},
	logout: async ({ url, request, locals, cookies }) => {
		const values = await request.formData();
		const logoutToken = values.get('logout_token') ?? undefined;
		const cookieHeader = request.headers.get('cookie') ?? undefined;
		return await auth
			.updateLogoutFlow(
				{
					token: typeof logoutToken === 'string' ? logoutToken : undefined,
					returnTo: url.searchParams.get('returnTo') ?? undefined
				},
				{
					headers: {
						cookie: cookieHeader ? decodeURIComponent(cookieHeader) : undefined
					}
				}
			)
			.then(
				({ headers }) => {
					cookies.delete('ory_kratos_session');
					DeleteCookiesByPrefix(cookieHeader, { cookies, prefix: 'csrf_token' });
					locals.user = undefined;
					if (headers['location']) {
						throw redirect(302, headers['location']);
					} else {
						throw redirect(302, '/');
					}
				},
				({ response: { data } }) => {
					const err = new Error('Error with updateLogoutFlow');
					console.log(err);
					console.log(data);
					throw error(500, 'Error logging out');
				}
			);
	}
} satisfies Actions;

const isLoginFlow = (response: object): response is LoginFlow => {
	return (response as LoginFlow).ui !== undefined;
};

const isRegistrationFlow = (response: object): response is RegistrationFlow => {
	return (response as RegistrationFlow).ui !== undefined;
};
