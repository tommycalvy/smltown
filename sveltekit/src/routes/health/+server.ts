import type { RequestHandler } from './$types';

export const GET = (() => {
    return new Response(null, {
        status: 200,
    });
}) satisfies RequestHandler;