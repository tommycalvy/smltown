import type { Actions } from './$types';
import { auth } from "$lib/server/auth";
import { error, redirect } from '@sveltejs/kit';
 
export const actions = {
  default: async ({ request, setHeaders }) => {
    // TODO log the user in
    const values = await request.formData();

    const authMethod = values.get('auth_method') ?? undefined;
	
	if (typeof authMethod !== 'string') {
		const err = new Error('No method attribute in post body');
		console.log(err);
		throw error(400, 'Incorrect Login');
	}

    const flow = values.get('flow') ?? undefined;
    const csrf_token = values.get('csrf_token') ?? undefined;
    const identifier = values.get('identifier') ?? undefined;
	const password = values.get('password') ?? undefined;

    let cookie = request.headers.get('cookie') ?? undefined;
	if (cookie) cookie = decodeURIComponent(cookie);

    if (
        typeof flow !== 'string' ||
        typeof csrf_token !== 'string' ||
        typeof identifier !== 'string' ||
        typeof password !== 'string'
    ) {
        const err = new Error('Credentials were not strings');
        console.log(err);
        throw error(400, 'Incorrect Login');
    }

    // Need to add OIDC method for social sign in e.g. sign in with google
    
    return await auth.updateLoginFlow({
        flow: flow,
        updateLoginFlowBody: {
            csrf_token: csrf_token,
            identifier: identifier,
            method: "password",
            password: password,
        }
    }).then(({ headers }) => {
        setHeaders({
            'set-cookie': headers['set-cookie']
        });
        if (headers['location']) {
            throw redirect(302, headers['location']);
        } else {
            throw redirect(302, '/');
        }
    })
  }
} satisfies Actions;