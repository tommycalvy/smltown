import { Theme } from "$lib/types";
import { User } from "$lib/server/auth";

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
