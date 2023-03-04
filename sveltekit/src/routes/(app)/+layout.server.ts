import type { LayoutServerLoad } from './$types';
import { auth, modifyAction } from '$lib/server/auth';
import { DeleteCookiesByPrefix, GetCookieByPrefix, SetCookies } from '$lib/utils';
import { error, redirect } from '@sveltejs/kit';
import { isVerificationFlow } from '$lib/types';
import type { UiContainer } from '@ory/kratos-client';

export const load = (async ({ locals, cookies, request, url }) => {
	console.log('(app)/+layout.server.ts load function ran');

	const cookieHeader = request.headers.get('cookie') ?? undefined;
	const decodedCookies = cookieHeader ? decodeURIComponent(cookieHeader) : undefined;

	const flowId = url.searchParams.get('flow') ?? undefined;

	if (locals.user) {
		const verifyEmailMethod = url.searchParams.get('/verification') ?? undefined;
		
		if (flowId && typeof verifyEmailMethod === 'string' && request.method === 'GET') {
			const verificationCookie = GetCookieByPrefix(cookieHeader, {
				prefix: 'verification_csrf_token',
				remove: 'verification_'
			});
			const sessionCookie = cookies.get('ory_kratos_session');
			const cookie =
				typeof verificationCookie === 'string' && typeof sessionCookie === 'string'
					? verificationCookie + sessionCookie
					: undefined;
			const createLogoutFlow = auth.createBrowserLogoutFlow({ cookie: decodedCookies });
			const getVerificationFlow = auth.getVerificationFlow({ id: flowId, cookie: cookie });
			return await Promise.allSettled([createLogoutFlow, getVerificationFlow]).then(
				([createLogoutFlowResult, getVerificationFlowResult]) => {
					let ui: UiContainer;
					let logoutToken: string;
					if (getVerificationFlowResult.status === 'fulfilled') {
						ui = getVerificationFlowResult.value.data.ui;
						DeleteCookiesByPrefix(cookieHeader, { cookies, prefix: 'verification_csrf_token' });
					} else {
						const { response: { data } } = getVerificationFlowResult.reason;
						if (isVerificationFlow(data)) {
							data.ui.action = modifyAction('?/verification&', data.ui.action);
							ui = data.ui;
						} else if (data.use_flow_id) {
							throw redirect(303, `?/verification&flow=${data.use_flow_id}`);
						} else if (data.error.id === 'security_csrf_violation') {
							const err = new Error('Error with getVerificationFlow');
							console.log(err);
							console.log(data);
							DeleteCookiesByPrefix(cookieHeader, { cookies, prefix: 'verification_csrf_token' });
							throw redirect(303, '?/verification');
						}
						const err = 'Error with createLogoutFlow or getVerificationFlow';
						console.log(err);
						console.log(data);
						throw error(500, 'Internal Error');
					}

					if (createLogoutFlowResult.status === 'fulfilled') {
						logoutToken = createLogoutFlowResult.value.data.logout_token;
					} else {
						const err = 'Error with createLogoutFlow';
						console.log(err);
						console.log(createLogoutFlowResult);
						throw error(500, 'Internal Error');
					}
					return {
						theme: locals.theme,
						user: locals.user,
						loginUi: undefined,
						signupUi: undefined,
						openLoginModal: false,
						openSignupModal: false,
						logoutToken: logoutToken,
						verifyEmailUi: ui,
						openVerifyEmailModal: true
					};
				}
			);
		}

		if (locals.user.verified || (request.method === 'POST' && typeof verifyEmailMethod === 'string')) {
			return await auth.createBrowserLogoutFlow({ cookie: decodedCookies }).then(
				({ data: { logout_token } }) => {
					return {
						theme: locals.theme,
						user: locals.user,
						loginUi: undefined,
						signupUi: undefined,
						openLoginModal: false,
						openSignupModal: false,
						logoutToken: logout_token,
						verifyEmailUi: undefined,
						openVerifyEmailModal: false
					};
				},
				({ request: { data } }) => {
					const err = 'Error with createLogoutFlow';
					console.log(err);
					console.log(data);
					throw error(500, 'Internal Error');
				}
			);
		}

		const createLogoutFlow = auth.createBrowserLogoutFlow({ cookie: decodedCookies });
		const createVerificationFlow = auth.createBrowserVerificationFlow();
		
		return await Promise.all([createLogoutFlow, createVerificationFlow]).then(
			([
				{
					data: { logout_token }
				},
				{
					headers,
					data: { ui }
				}
			]) => {
				SetCookies(headers['set-cookie'], { cookies, prefix: 'verification_' });
				ui.action = modifyAction('?/verification&', ui.action);
				if (typeof verifyEmailMethod === 'string') {
					return {
						theme: locals.theme,
						user: locals.user,
						loginUi: undefined,
						signupUi: undefined,
						openLoginModal: false,
						openSignupModal: false,
						logoutToken: logout_token,
						verifyEmailUi: ui,
						openVerifyEmailModal: true
					};
				}
				return {
					theme: locals.theme,
					user: locals.user,
					loginUi: undefined,
					signupUi: undefined,
					openLoginModal: false,
					openSignupModal: false,
					logoutToken: logout_token,
					verifyEmailUi: ui,
					openVerifyEmailModal: false
				};
			},
			({ response: { data } }) => {
				const err = 'Error with createLogoutFlow or createVerificationFLow';
				console.log(err);
				console.log(data);
				throw error(500, 'Internal Error');
			}
		);
	}

	const loginMethod = url.searchParams.get('/login') ?? undefined;
	const signupMethod = url.searchParams.get('/signup') ?? undefined;

	if (request.method === 'POST') {
		if (typeof loginMethod === 'string') {
			return await auth.createBrowserRegistrationFlow().then(
				({ headers, data: { ui } }) => {
					SetCookies(headers['set-cookie'], { cookies, prefix: 'signup_' });
					ui.action = modifyAction('?/signup&', ui.action);
					return {
						theme: locals.theme,
						loginUi: undefined,
						signupUi: ui,
						openLoginModal: true,
						openSignupModal: false,
						logoutToken: undefined,
						verifyEmailUi: undefined,
						openVerifyEmailModal: false
					};
				},
				({ response: { data } }) => {
					const err = 'Error with createRegistrationFlow';
					console.log(err);
					console.log(data);
					throw error(500, 'Internal Error');
				}
			);
		}
		if (typeof signupMethod === 'string') {
			return await auth.createBrowserLoginFlow({ cookie: decodedCookies }).then(
				({ headers, data: { ui } }) => {
					SetCookies(headers['set-cookie'], { cookies, prefix: 'login_' });
					ui.action = modifyAction('?/login&', ui.action);
					return {
						theme: locals.theme,
						loginUi: ui,
						signupUi: undefined,
						openLoginModal: false,
						openSignupModal: true,
						logoutToken: undefined,
						verifyEmailUi: undefined,
						openVerifyEmailModal: false
					};
				},
				({ response: { data } }) => {
					const err = 'Error with createLoginFlow';
					console.log(err);
					console.log(data);
					throw error(500, 'Internal Error');
				}
			);
		}
	}

	if (flowId) {
		if (typeof loginMethod === 'string') {
			const loginCookie = GetCookieByPrefix(cookieHeader, {
				prefix: 'login_csrf_token',
				remove: 'login_'
			});

			const getLoginFlow = auth.getLoginFlow({ id: flowId, cookie: loginCookie });
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
						openSignupModal: false,
						logoutToken: undefined,
						verifyEmailUi: undefined,
						openVerifyEmailModal: false
					};
				},
				({ response: { data, status } }) => {
					const err = 'Error with getLoginFlow or createRegistrationFlow';
					console.log(err);
					console.log(status);
					console.log(data);
					if (data.use_flow_id) {
						throw redirect(303, `?/login&flow=${data.use_flow_id}`);
					} else if (status === 403) {
						DeleteCookiesByPrefix(cookieHeader, { cookies, prefix: 'csrf_token' });
					}
					throw redirect(303, '?/login');
				}
			);
		}
		if (typeof signupMethod === 'string') {
			const createLoginFlow = auth.createBrowserLoginFlow({ cookie: decodedCookies });

			const signupCookie = GetCookieByPrefix(cookieHeader, {
				prefix: 'signup_csrf_token',
				remove: 'signup'
			});

			const getRegistrationFlow = auth.getRegistrationFlow({ id: flowId, cookie: signupCookie });
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
						openSignupModal: true,
						logoutToken: undefined,
						verifyEmailUi: undefined,
						openVerifyEmailModal: false
					};
				},
				({ response: { data, status } }) => {
					const err = 'Error with getRegistrationFlow or createLoginFlow';
					console.log(err);
					console.log('Status: ', status);
					console.log(data);
					if (data.use_flow_id) {
						throw redirect(303, `?/signup&flow=${data.use_flow_id}`);
					} else if (status === 403) {
						DeleteCookiesByPrefix(cookieHeader, { cookies, prefix: 'csrf_token' });
					}
					throw redirect(303, '?/signup');
				}
			);
		}
	}

	const createLoginFlow = auth.createBrowserLoginFlow({ cookie: decodedCookies });
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
					logoutToken: undefined,
					verifyEmailUi: undefined,
					openVerifyEmailModal: false
				};
			}
			if (typeof signupMethod === 'string') {
				return {
					theme: locals.theme,
					loginUi: loginData.ui,
					signupUi: signupData.ui,
					openLoginModal: false,
					openSignupModal: true,
					logoutToken: undefined,
					verifyEmailUi: undefined,
					openVerifyEmailModal: false
				};
			}
			return {
				theme: locals.theme,
				loginUi: loginData.ui,
				signupUi: signupData.ui,
				openLoginModal: false,
				openSignupModal: false,
				logoutToken: undefined,
				verifyEmailUi: undefined,
				openVerifyEmailModal: false
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
