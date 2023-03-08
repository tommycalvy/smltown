import { Configuration, FrontendApi, IdentityApi } from '@ory/kratos-client';
import { KRATOS_PUBLIC_URL } from '$env/static/private';
import { KRATOS_ADMIN_URL } from "$env/static/private";
export const auth = new FrontendApi(
	new Configuration({
		basePath: KRATOS_PUBLIC_URL,
		baseOptions: {
			withCredentials: true
		}
	})
);

export const identity = new IdentityApi(
	new Configuration({
		basePath: KRATOS_ADMIN_URL,
		baseOptions: {
			withCredentials: true
		}
	})
)



export const modifyAction = (base: string, action: string): string => {
	const params = action.split('?');
	return base + params[1];
};
