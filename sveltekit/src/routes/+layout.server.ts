import type { LayoutServerLoad } from './$types';
import { auth, modifyAction } from "$lib/server/auth";

export const load = (async ({ locals, setHeaders}) => {
    
	if (locals.user) {
		return {
			theme: locals.theme,
			user: locals.user,
			loginUi: undefined,
			signupUi: undefined,
		};
	}
	const loginData = await auth.createBrowserLoginFlow();
	setHeaders({
		'set-cookie': loginData.headers['set-cookie']
	});
	loginData.data.ui.action = modifyAction('/login', loginData.data.ui.action);

	const signupData = await auth.createBrowserRegistrationFlow();
	signupData.data.ui.action = modifyAction('/signup', signupData.data.ui.action);
	return {
		theme: locals.theme,
		user: undefined,
		loginUi: loginData.data.ui,
		signupUi: signupData.data.ui,
	}
	
}) satisfies LayoutServerLoad;
