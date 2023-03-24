import type { VerificationFlow } from "@ory/kratos-client";

const allThemes = ['light', 'dark'] as const;
export type Theme = (typeof allThemes)[number];

export function isTheme(value: string): value is Theme {
	return allThemes.includes(value as Theme);
}

export type WithTarget<Event, Target> = Event & { currentTarget: Target };

export interface UserSession {
	id: 		string;
	username: 	string;
	email: 		string;
	verified: 	boolean;
	admin: 		boolean;
}

export interface User {
	Username: 	string;
	Email: 		string;
	Admin: 		boolean;
	OryId: 		string;
}

export interface Post {
	username: 	string;
	title: 		string;
	body: 		string;
	channel1: 	string;
	channel2: 	string;
	latitude: 	string;
	longitude: 	string;
	votes: 		number;
}

export interface Filter {
	timestamp: 	number;  
    latitude:	string; 
	longitude:	string;	
	channel1:	string;
	channel2:	string;	
	georange:	number;	
}

export const isVerificationFlow = (response: object): response is VerificationFlow => {
	return (response as VerificationFlow).ui !== undefined;
};
