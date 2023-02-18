import { Theme } from "$lib/types";

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			theme: Theme
		}
		// interface PageData {}
		// interface Platform {}
	}
}

export {};
