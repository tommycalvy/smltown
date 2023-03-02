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
