import type { PageServerLoad } from './$types';
import type { Actions } from './$types';
import { error, fail } from '@sveltejs/kit';
import { env } from "$env/dynamic/private";
import { identity } from "$lib/server/auth";
import type { User } from "$lib/types";


export const load = (async () => {
	return {
		title: 'Users'
	};
}) satisfies PageServerLoad;

export const actions = {
	createUser: async ({ locals, request, fetch }) => {
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
			return fail(400, { createUser: 'Error: username, password, or email missing'});
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
				},
				metadata_public: {
					admin: admin
				}
			}
		}).then(({ data: { id } }) => {
			const user: User = {
				"Username": username, 
				"Email": email, 
				"Admin": admin, 
				"OryId": id, 
			}
			console.log(user);
			return fetch(`${env.CRUD_SERVICE_URL}/users/v0/`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json; charset=utf-8'
				},
				body: JSON.stringify({"User": user})
			}).then((response) => {
				console.log('success?');
				console.log(response);
				return {
					createUser: "Success! User Created."
				}
			}, ({ request }) => {
				console.log(request);
				return fail(400, { createUser: 'Error: Crud_Service Error'});
			})
		}, ({ request }) => {
			console.log('Kratos create identity error');
			console.log(request);
			return fail(400, { createUser: 'Error: username, password, or email missing'});
		})
		
	},
	getUserByUsername: async () => {
		// TODO log the user in
	}
} satisfies Actions;
