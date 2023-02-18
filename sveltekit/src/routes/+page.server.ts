import type { Actions } from './$types';

export const actions = {
	setTheme: async ({ request }) => {
		const values = await request.formData();
		const theme = values.get('theme');
		console.log(theme);
	}
} satisfies Actions;
