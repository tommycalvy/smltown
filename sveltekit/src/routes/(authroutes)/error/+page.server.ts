import { auth } from "$lib/server/auth";
import type { PageServerLoad } from './$types';
import type { GenericError } from "@ory/kratos-client";

export const load = (async ({ url }) => {
    const flowId = url.searchParams.get('id');
	
    if (flowId) {
        await auth.getFlowError({
            id: flowId
        }).then(({ data: { error } }) => {
            
            if(error && isGenericError(error)) {
                console.log(error.debug);
                return {
                    message: error.message,
                }
            }
        }, ({ response }) => {
            const err = new Error('getFlowError errored');
            console.log(err);
            console.log(response);
        })
    }
	return {
		message: 'And nobody knows why.'
	};
}) satisfies PageServerLoad;

const isGenericError = (error: object): error is GenericError => {
    return (error as GenericError).message !== undefined;
}
