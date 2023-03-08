import { error } from "@sveltejs/kit";
import type { LayoutServerLoad } from './$types';

export const load = (async ({ locals }) => {

    if (locals.user) {
        if (locals.user.admin) {
            return {
                adminName: locals.user.username
            };
        }
    }
    throw error(400, "You aren't an admin silly and PLZ don't hack me");
   
}) satisfies LayoutServerLoad;
