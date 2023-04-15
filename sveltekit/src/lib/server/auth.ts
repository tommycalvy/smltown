import { Configuration, FrontendApi, IdentityApi } from '@ory/kratos-client';
import { env } from '$env/dynamic/private';
export const auth = new FrontendApi(
	new Configuration({
		basePath: env.KRATOS_PUBLIC_URL,
		baseOptions: {
			withCredentials: true
		}
	})
);

export const identity = new IdentityApi(
	new Configuration({
		basePath: env.KRATOS_ADMIN_URL,
		baseOptions: {
			withCredentials: true
		}
	})
)



export const modifyAction = (base: string, action: string): string => {
	const params = action.split('?');
	return base + params[1];
};
