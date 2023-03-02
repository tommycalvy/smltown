import type { LayoutServerLoad } from './$types';
import { auth, modifyAction } from '$lib/server/auth';
import { GetCookieByPrefix, SetCookies } from '$lib/utils';
import { error } from '@sveltejs/kit';

export const load = (async ({ locals, cookies, request, url }) => {
	console.log('(app)/+layout.server.ts load function ran');

	if (locals.user) {
		return {
			theme: locals.theme,
			user: locals.user,
			loginUi: undefined,
			signupUi: undefined,
			openLoginModal: false,
			openSignupModal: false
		};
	}

	const loginMethod = url.searchParams.get('/login') ?? undefined;
	const signupMethod = url.searchParams.get('/signup') ?? undefined;
	const flowId = url.searchParams.get('flow') ?? undefined;
	let cookie = request.headers.get('cookie') ?? undefined;

	if (request.method === 'POST') {
		if (typeof loginMethod === 'string') {
			return await auth.createBrowserRegistrationFlow().then(({ headers, data: { ui } }) => {
				SetCookies(headers['set-cookie'], { cookies, prefix: 'signup_' });
				ui.action = modifyAction('?/signup&', ui.action);
				return {
					theme: locals.theme,
					loginUi: undefined,
					signupUi: ui,
					openLoginModal: true,
					openSignupModal: false
				};
			}, ({response: { data } }) => {
				const err = 'Error with createRegistrationFlow';
				console.log(err);
				console.log(data);
				throw error(500, 'Internal Error');
			});
		}
		if (typeof signupMethod === 'string') {
			return await auth.createBrowserLoginFlow({ cookie }).then(({ headers, data: { ui } }) => {
				SetCookies(headers['set-cookie'], { cookies, prefix: 'login_' });
				ui.action = modifyAction('?/login&', ui.action);
				return {
					theme: locals.theme,
					loginUi: ui,
					signupUi: undefined,
					openLoginModal: false,
					openSignupModal: true
				};
			}, ({response: { data } }) => {
				const err = 'Error with createLoginFlow';
				console.log(err);
				console.log(data);
				throw error(500, 'Internal Error');
			});
		}
	} 
	
	if (flowId) {
		if (typeof loginMethod === 'string') {
			
			if (cookie) {
				cookie = decodeURIComponent(cookie);
				cookie = GetCookieByPrefix(cookie, { prefix: 'login_csrf_token', remove: 'login_' });
			}
			const getLoginFlow = auth.getLoginFlow({ id: flowId, cookie });
			const createRegistrationFlow = auth.createBrowserRegistrationFlow();
			return Promise.all([getLoginFlow, createRegistrationFlow]).then(
				([
					{ data: loginData, headers: loginHeaders },
					{ data: signupData, headers: signupHeaders }
				]) => {

					SetCookies(loginHeaders['set-cookie'], { cookies, prefix: 'login_' });
					SetCookies(signupHeaders['set-cookie'], { cookies, prefix: 'signup_' });
					loginData.ui.action = modifyAction('?/login&', loginData.ui.action);
					signupData.ui.action = modifyAction('?/signup&', signupData.ui.action);
					return {
						theme: locals.theme,
						loginUi: loginData.ui,
						signupUi: signupData.ui,
						openLoginModal: true,
						openSignupModal: false
					};
				},
				({ response: { data } }) => {
					const err = 'Error with getLoginFlow or createRegistrationFlow';
					console.log(err);
					console.log(data);
					throw error(500, 'Internal Error');
				});
		}
		if (typeof signupMethod === 'string') {
			
			const createLoginFlow = auth.createBrowserLoginFlow({ cookie });
			if (cookie) {
				cookie = decodeURIComponent(cookie);
				cookie = GetCookieByPrefix(cookie, { prefix: 'signup_csrf_token', remove: 'signup' });
			}
			const getRegistrationFlow = auth.getRegistrationFlow({ id: flowId, cookie });
			return Promise.all([createLoginFlow, getRegistrationFlow]).then(
				([
					{ data: loginData, headers: loginHeaders },
					{ data: signupData, headers: signupHeaders }
				]) => {
					SetCookies(loginHeaders['set-cookie'], { cookies, prefix: 'login_' });
					SetCookies(signupHeaders['set-cookie'], { cookies, prefix: 'signup_' });
					loginData.ui.action = modifyAction('?/login&', loginData.ui.action);
					signupData.ui.action = modifyAction('?/signup&', signupData.ui.action);
					return {
						theme: locals.theme,
						loginUi: loginData.ui,
						signupUi: signupData.ui,
						openLoginModal: false,
						openSignupModal: true
					};
				},
				({ response: { data } }) => {
					const err = 'Error with getRegistrationFlow or createLoginFlow';
					console.log(err);
					console.log(data);
					throw error(500, 'Internal Error');
				});
		}
	}		

	const createLoginFlow = auth.createBrowserLoginFlow({ cookie });
	const createSignupFlow = auth.createBrowserRegistrationFlow();

	return Promise.all([createLoginFlow, createSignupFlow]).then(
		([
			{ data: loginData, headers: loginHeaders },
			{ data: signupData, headers: signupHeaders }
		]) => {
			SetCookies(loginHeaders['set-cookie'], { cookies, prefix: 'login_' });
			SetCookies(signupHeaders['set-cookie'], { cookies, prefix: 'signup_' });
			loginData.ui.action = modifyAction('?/login&', loginData.ui.action);
			signupData.ui.action = modifyAction('?/signup&', signupData.ui.action);
			if (typeof loginMethod === 'string') {
				return {
					theme: locals.theme,
					loginUi: loginData.ui,
					signupUi: signupData.ui,
					openLoginModal: true,
					openSignupModal: false,
				}
			}
			if (typeof signupMethod === 'string') {
				return {
					theme: locals.theme,
					loginUi: loginData.ui,
					signupUi: signupData.ui,
					openLoginModal: false,
					openSignupModal: true,
					
				}
			}
			return {
				theme: locals.theme,
				loginUi: loginData.ui,
				signupUi: signupData.ui,
				openLoginModal: false,
				openSignupModal: false,
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
