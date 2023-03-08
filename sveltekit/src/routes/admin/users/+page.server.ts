import type { PageServerLoad } from "./$types";

export const load = (async () => {
	
	return {
		title: 'Users'
	};
}) satisfies PageServerLoad;