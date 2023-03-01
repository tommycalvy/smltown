import type { PageServerLoad, Actions } from './$types';
import { error } from "@sveltejs/kit";
import { auth } from "$lib/server/auth";
import type { LoginFlow, UpdateLoginFlowBody } from "@ory/kratos-client";
import { redirect, fail } from "@sveltejs/kit";
import { SetCookies } from "$lib/utils";

export const load = (async ({ parent }) => {
	const { user } = await parent();
	return {
		user: user,
		title: user + " - SMLTOWN"
	};
}) satisfies PageServerLoad;

export const actions = {
	login: async ({ request, url, cookies }) => {
		// TODO log the user in
		console.log('(app)/+page.server.ts login action ran');
		console.log(request);
		const flowId = url.searchParams.get('flow') ?? undefined;
		console.log(flowId);
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

					SetCookies(headers['set-cookie'], cookies);

					if (headers['location']) {
						throw redirect(302, headers['location']);
					} else {
						throw redirect(302, '/');
					}
				},
				({ response: { data } }) => {
					if (isLoginFlow(data)) {
						return fail(400, {
							ui: data.ui
						});
					} else {
						console.log(data);

					}
					
				}
			);
	}
} satisfies Actions;


const isLoginFlow = (response: object): response is LoginFlow => {
	return (response as LoginFlow).ui !== undefined
}