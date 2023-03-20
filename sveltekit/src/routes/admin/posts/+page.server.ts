import type { PageServerLoad } from './$types';
import type { Actions } from './$types';
import { error, fail } from '@sveltejs/kit';
import { CRUD_SERVICE_URL } from '$env/static/private';
import type { Post } from '$lib/types';

export const load = (async () => {
	return {
		title: 'Posts'
	};
}) satisfies PageServerLoad;

export const actions = {
	createPost: async ({ locals, request, fetch }) => {
		if (!locals.userSession) {
			throw error(400, 'Unauthorized');
		}
		if (!locals.userSession.admin) {
			throw error(400, 'Unauthroized');
		}
		const values = await request.formData();
		const title = values.get('title') ?? undefined;
		const body = values.get('body') ?? undefined;
		const category1 = values.get('category1') ?? undefined;
		const category2 = values.get('category2') ?? undefined;
		const latitude = values.get('latitude') ? Number(values.get('latitude')) : undefined;
		const longitude = values.get('longitude') ? Number(values.get('longitude')) : undefined;

		if (
			typeof title !== 'string' ||
			typeof body !== 'string' ||
			typeof category1 !== 'string' ||
			typeof category2 !== 'string' ||
			typeof latitude === 'undefined' || 
			typeof longitude === 'undefined'
		) {
			return fail(400, { createPost: 'Error: title, body, categories, or coordinates missing' });
		}

		const post: Post = {
			username: locals.userSession.username,
			title: title,
			body: body,
			channel1: category1,
			channel2: category2,
			latitude: latitude,
			longitude: longitude,
			votes: 0,
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
	},
	getUserByUsername: async (event) => {
		// TODO log the user in
	}
} satisfies Actions;
