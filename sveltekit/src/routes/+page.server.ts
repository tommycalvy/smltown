import type { PageServerLoad } from './$types';

export const load = (async ({ parent }) => {
	const { user } = await parent();
	return {
		user: user,
		title: user + " - SMLTOWN"
	};
}) satisfies PageServerLoad;
