import type { VerificationFlow } from "@ory/kratos-client";

const allThemes = ['light', 'dark'] as const;
export type Theme = (typeof allThemes)[number];

export function isTheme(value: string): value is Theme {
	return allThemes.includes(value as Theme);
}

export type WithTarget<Event, Target> = Event & { currentTarget: Target };

export interface User {
	id: string;
	username: string;
	email: string;
	verified: boolean;
}

export const isVerificationFlow = (response: object): response is VerificationFlow => {
	return (response as VerificationFlow).ui !== undefined;
};
