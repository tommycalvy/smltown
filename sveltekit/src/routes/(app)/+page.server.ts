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
import { env } from '$env/dynamic/private';
import { z } from 'zod';

export const load = (async ({ locals, getClientAddress }) => {
	try {
		let lat: string;
		let lon: string;
		if (!locals.latitude || !locals.longitude) {
			let ip: string;
			if (env.ENVIRONMENT === 'development') {
				ip = '';
			} else {
				ip = getClientAddress();
			}
			console.log('ip: ' + ip);
			const ipresponse = await fetch(`http://ip-api.com/json/${ip}?fields=lat,lon`);
			if (!ipresponse.ok) throw new Error('ipresponse not ok');
			const coords: { lat: number; lon: number } = await ipresponse.json();
			lat = Number(coords.lat).toFixed(3);
			lon = Number(coords.lon).toFixed(3);
		} else {
			lat = locals.latitude;
			lon = locals.longitude;
		}
		console.log('lat: ' + lat);
		console.log('lon: ' + lon);
		const filter: Filter = {
			timestamp: 0,
			latitude: lat,
			longitude: lon,
			channel1: '',
			channel2: '',
			georange: locals.rangeInput,
			minresults: 10,
		};
		const hotresponse = await fetch(`${env.CRUD_SERVICE_URL}/posts/v0/gethotpostsnearme`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json; charset=utf-8'
			},
			body: JSON.stringify({ Filter: filter })
		});
		const { posts } : { posts: Post[] } = await hotresponse.json();
		console.log('posts');
		console.log(posts);
		return {
			userSession: locals.userSession,
			title: 'SMLTOWN',
			posts: posts,
			rangeInput: locals.rangeInput,
		};
	} catch (error) {
		console.log('Error with getting ipaddress or hotpostsnearme');
		console.log(error);
		return {
			userSession: locals.userSession,
			title: 'SMLTOWN',
			posts: undefined,
			rangeInput: locals.rangeInput,
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
		const formData = Object.fromEntries(await request.formData());
		const postSchema = z.object({
			title: z.string().trim().min(1).max(300),
			body: z.string().max(40000),
			channel1: z.string().min(1).max(30),
			channel2: z.string().min(1).max(30),
			latitude: z.preprocess((lat) => Number(lat), z.number().min(-90).max(90).transform((lat) => lat.toFixed(3))),
			longitude: z.preprocess((lon) => Number(lon), z.number().min(-180).max(180).transform((lat) => lat.toFixed(3))),
		});
		const postData = postSchema.safeParse(formData);
		if (!postData.success) {
			const errors = postData.error.errors.map((error) => {
				return {
					field: error.path[0],
					message: error.message
				};
			});
			return fail(400, { errors });
		}

		const post: Post = {
			username: locals.userSession.username,
			timestamp: 0,
			title: postData.data.title,
			body: postData.data.body,
			channel1: postData.data.channel1,
			channel2: postData.data.channel2,
			latitude: postData.data.latitude,
			longitude: postData.data.longitude,
			votes: 0
		};

		console.log(post);
		const res = await fetch(`${env.CRUD_SERVICE_URL}/posts/v0/`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json; charset=utf-8'
			},
			body: JSON.stringify({ Post: post })
		});
		if (!res.ok) {
			const err = new Error('Error with createPost');
			console.log(err);
			console.log(res);
			throw error(500, 'Error creating post');
		}
		const data = await res.json();
		console.log(data);
		locals.latitude = postData.data.latitude;
		locals.longitude = postData.data.longitude;
		return {
			createPost: 'Success! Post Created.'
		};
	},
	getPosts: async ({ locals, request }) => {
		const formData = Object.fromEntries(await request.formData());
		const postSchema = z.object({
			rangeInput: z.preprocess((range) => Number(range), z.number().min(5).max(1000)),
			latitude: z.preprocess((lat) => Number(lat), z.number().min(-90).max(90).transform((lat) => lat.toFixed(3))),
			longitude: z.preprocess((lon) => Number(lon), z.number().min(-180).max(180).transform((lat) => lat.toFixed(3))),
		});
		const postData = postSchema.safeParse(formData);
		if (!postData.success) {
			const errors = postData.error.errors.map((error) => {
				return {
					field: error.path[0],
					message: error.message
				};
			});
			return fail(400, { errors });
		}
		locals.rangeInput = postData.data.rangeInput;
		locals.latitude = postData.data.latitude;
		locals.longitude = postData.data.longitude;
		return {
			getPosts: 'Success!'
		}
	},
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
