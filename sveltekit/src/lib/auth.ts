import { Configuration, FrontendApi } from '@ory/kratos-client';
import config from '$lib/config';

export const auth = new FrontendApi(
	new Configuration({
		basePath: config.kratos.public,
		baseOptions: {
			withCredentials: true
		}
	})
);

export interface User {
	id: string;
	email: string;
	name: string;
	verified: boolean;
	color: string;
}

export const modifyAction = (base: string, action: string): string => {
	const params = action.split('?');
	return base + '?' + params[1];
};
