import type { PageServerLoad } from './$types';
import type { Actions } from './$types';
import { error, fail } from '@sveltejs/kit';
import { CRUD_SERVICE_URL } from "$env/static/private";
import { identity } from "$lib/server/auth";
import type { User } from "$lib/types";


export const load = (async () => {
	return {
		title: 'Users'
	};
}) satisfies PageServerLoad;

export const actions = {
	createUser: async ({ locals, request }) => {
		if (!locals.userSession) {
			throw error(400, 'Unauthorized');
		}
		if (!locals.userSession.admin) {
			throw error(400, "Unauthroized");
		}
		const values = await request.formData();
		const username = values.get('username') ?? undefined;
		const password = values.get('password') ?? undefined;
		const email = values.get('email') ?? undefined;
		const admin = values.get('admin') === 'true' ? true : false;

		if (typeof username !== 'string' || typeof password !== 'string' || typeof email !== 'string') {
			return fail(400, { error: 'Error: username, password, or email missing'});
		}

		return await identity.createIdentity({
			createIdentityBody: {
				schema_id: 'user_v0',
				credentials: {
					password: {
						config: {
							password: password
						}
					},

				},
				traits: {
					username: username,
					email: email,
				}
			}
		}).then(() => {
			const user: User = { username, email, admin }
			return fetch(`${CRUD_SERVICE_URL}/users/v0`, {
				method: 'POST',
				body: JSON.stringify(user)
			});
		})
		
	},
	getUserByUsername: async (event) => {
		// TODO log the user in
	}
} satisfies Actions;
