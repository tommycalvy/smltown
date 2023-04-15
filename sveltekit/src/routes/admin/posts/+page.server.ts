import type { PageServerLoad } from './$types';
import type { Actions } from './$types';
import { error, fail } from '@sveltejs/kit';
import type { Post } from '$lib/types';
import { env } from '$env/dynamic/private';
import { z } from 'zod';

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
	getUserByUsername: async () => {
		// TODO log the user in
	}
} satisfies Actions;
