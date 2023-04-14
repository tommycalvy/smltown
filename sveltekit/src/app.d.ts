import { Theme, UserSession } from "$lib/types";

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			theme: Theme,
			userSession: UserSession | undefined,
			postRange: number,
		}
		// interface PageData {}
		// interface Platform {}
	}
}

export {};
