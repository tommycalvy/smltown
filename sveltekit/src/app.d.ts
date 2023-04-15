import { Theme, UserSession } from "$lib/types";

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			theme: Theme,
			userSession: UserSession | undefined,
			rangeInput: number,
			latitude: string,
			longitude: string,
		}
		// interface PageData {}
		// interface Platform {}
	}
}

export {};
