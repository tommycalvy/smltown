import type { PageServerLoad, Actions } from './$types';
import { error } from '@sveltejs/kit';
import { auth, modifyAction } from '$lib/server/auth';
import type {
	LoginFlow,
	RegistrationFlow,
	UpdateLoginFlowBody,
	UpdateRegistrationFlowBody,
	UpdateVerificationFlowBody,
	VerificationFlow
} from '@ory/kratos-client';
import { redirect, fail } from '@sveltejs/kit';
import { DeleteCookiesByPrefix, GetCookieByPrefix, SetCookies } from '$lib/utils';
import type { Filter, Post } from '$lib/types';
import { CRUD_SERVICE_URL } from '$env/static/private';

export const load = (async ({ locals, getClientAddress }) => {
	try {
		let ip = getClientAddress();
		if (ip === '127.0.0.1') ip = '';
		const ipresponse = await fetch(`http://ip-api.com/json/${ip}?fields=lat,lon`);
		const coords: { lat: number; lon: number} = await ipresponse.json();
		const lat = Math.floor((Number(coords.lat) + 180) * 10000);
		const lon = Math.floor((Number(coords.lon) + 180) * 10000);
		const filter: Filter = {
			timestamp: 0,
			latitude: lat,
			longitude: lon,
			channel1: 'General',
			channel2: '',
			georange: 2000
		};
		const hotresponse = await fetch(`${CRUD_SERVICE_URL}/posts/v0/gethotpostsnearme`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json; charset=utf-8'
			},
			body: JSON.stringify({ Filter: filter })
		});
		console.log('hotresponse');
		console.log(hotresponse);
		const posts = await hotresponse.json();
		console.log('posts');
		console.log(posts);
		return {
			userSession: locals.userSession,
			title: 'SMLTOWN',
			posts: undefined,
		}
	} catch (error) {
		console.log('Error with getting ipaddress or hotpostsnearme');
		console.log(error);
		return {
			userSession: locals.userSession,
			title: 'SMLTOWN',
			posts: undefined,
		};
	}
	
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
					SetCookies(headers['set-cookie'], { cookies }); // Sets a csrf_token
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
					SetCookies(headers['set-cookie'], { cookies }); // Sets a csrf_token
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
					locals.userSession = undefined;
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
	},
	verification: async ({ url, request, cookies }) => {
		const flowId = url.searchParams.get('flow') ?? undefined;
		if (typeof flowId !== 'string') {
			const err = new Error('No flow id');
			console.log(err);
			throw error(400, 'No flow id');
		}

		const values = await request.formData();
		const authMethod = values.get('auth_method') ?? undefined;

		if (typeof authMethod !== 'string') {
			const err = new Error('No method attribute in post body');
			console.log(err);
			throw error(400, 'No method attribute in post body');
		}

		let flowBody: UpdateVerificationFlowBody;
		if (authMethod === 'link') {
			const email = values.get('email') ?? undefined;
			const csrf_token = values.get('csrf_token') ?? undefined;
			if (typeof email === 'string' && typeof csrf_token === 'string') {
				flowBody = {
					csrf_token,
					email,
					method: authMethod
				};
			} else {
				throw error(400, 'Incorrect form data');
			}
		} else {
			const err = new Error('Verification method not supported');
			console.log(err);
			throw error(400, 'Verification method not supported');
		}

		const cookieHeader = request.headers.get('cookie') ?? undefined;
		const verificationCookie = GetCookieByPrefix(cookieHeader, {
			prefix: 'verification_csrf_token',
			remove: 'verification_'
		});
		const sessionCookie = cookies.get('ory_kratos_session');
		const cookie =
			typeof verificationCookie === 'string' && typeof sessionCookie === 'string'
				? verificationCookie + sessionCookie
				: undefined;

		return await auth
			.updateVerificationFlow({
				flow: flowId,
				updateVerificationFlowBody: flowBody,
				cookie: cookie
			})
			.then(
				({ data: { ui } }) => {
					ui.action = modifyAction('?/verification&', ui.action);
					return {
						verifyEmailUi: ui
					};
				},
				({ response: { data } }) => {
					if (isVerificationFlow(data)) {
						data.ui.action = modifyAction('?/verification&', data.ui.action);
						return fail(400, { verifyEmailUi: data.ui });
					} else if (data.use_flow_id) {
						throw redirect(303, `?/verification&flow=${data.use_flow_id}`);
					} else if (data.error.id === 'security_csrf_violation') {
						const err = new Error('Error with updateVerificationFlow');
						console.log(err);
						console.log(data);
						DeleteCookiesByPrefix(cookieHeader, { cookies, prefix: 'verification_csrf_token' });
						throw redirect(303, '?/verification');
					}
					const err = new Error('Error with updateVerificationFlow');
					console.log(err);
					console.log(data);
					throw error(500, 'Error verifying email');
				}
			);
	},
	createPost: async ({ locals, request }) => {
		if (!locals.userSession) {
			throw error(400, 'Unauthorized');
		}
		if (!locals.userSession.admin) {
			throw error(400, 'Unauthroized');
		}
		const values = await request.formData();
		const title = values.get('title') ?? undefined;
		const body = values.get('body') ?? undefined;
		const channel1 = values.get('channel1') ?? undefined;
		const channel2 = values.get('channel2') ?? undefined;
		const latitude = values.get('latitude')
			? Math.floor((Number(values.get('latitude')) + 180) * 10000)
			: undefined;
		const longitude = values.get('longitude')
			? Math.floor((Number(values.get('longitude')) + 180) * 10000)
			: undefined;

		if (
			typeof title !== 'string' ||
			typeof body !== 'string' ||
			typeof channel1 !== 'string' ||
			typeof channel2 !== 'string' ||
			typeof latitude === 'undefined' ||
			typeof longitude === 'undefined'
		) {
			return fail(400, { createPost: 'Error: title, body, categories, or coordinates missing' });
		}

		const post: Post = {
			username: locals.userSession.username,
			title: title,
			body: body,
			channel1: channel1,
			channel2: channel2,
			latitude: latitude,
			longitude: longitude,
			votes: 0
		};
		console.log(post);
		return fetch(`${CRUD_SERVICE_URL}/posts/v0/`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json; charset=utf-8'
			},
			body: JSON.stringify({ Post: post })
		}).then(
			(response) => {
				console.log('success?');
				console.log(response);
				return {
					createPost: 'Success! Post Created.'
				};
			},
			({ request }) => {
				console.log(request);
				return fail(400, { createPost: 'Error: Crud_Service Error' });
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

const isVerificationFlow = (response: object): response is VerificationFlow => {
	return (response as VerificationFlow).ui !== undefined;
};
