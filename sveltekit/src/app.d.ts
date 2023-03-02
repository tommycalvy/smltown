import { Theme, User } from "$lib/types";

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			theme: Theme,
			user: User | undefined,
		}
		// interface PageData {}
		// interface Platform {}
	}
}

export {};
