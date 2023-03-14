import { error } from "@sveltejs/kit";
import type { LayoutServerLoad } from './$types';

export const load = (async ({ locals }) => {

    if (locals.userSession) {
        if (locals.userSession.admin) {
            return {
                adminName: locals.userSession.username
            };
        }
    }
    throw error(400, "You aren't an admin silly and PLZ don't hack me");
   
}) satisfies LayoutServerLoad;
