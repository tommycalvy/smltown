import type { UiNodeAttributes, UiNodeInputAttributes } from '@ory/kratos-client';
import type { Cookies } from "@sveltejs/kit";

export const isUiNodeInputAttributes = (
	attributes: UiNodeAttributes
): attributes is UiNodeInputAttributes => {
	return (attributes as UiNodeInputAttributes).node_type === 'input';
};

const decode = (str: string) => {
	return str.indexOf('%') !== -1 ? decodeURIComponent(str) : str;
};

const tryDecode = (str: string) => {
	try {
		return decode(str);
	} catch (e) {
		return str;
	}
};

export const parseCookies = (str: string) => {
	
	const cookieMap = new Map<string,string>();
	let index = 0;
	while (index < str.length) {
		const eqIdx = str.indexOf('=', index);

		// no more cookie pairs
		if (eqIdx === -1) {
			break;
		}

		let endIdx = str.indexOf(';', index);

		if (endIdx === -1) {
			endIdx = str.length;
		} else if (endIdx < eqIdx) {
			// backtrack on prior semicolon
			index = str.lastIndexOf(';', eqIdx - 1) + 1;
			continue;
		}

		const key = str.slice(index, eqIdx).trim();

		// only assign once
		if (!cookieMap.has(key)) {
			let val = str.slice(eqIdx + 1, endIdx).trim();

			// quoted values
			if (val.charCodeAt(0) === 0x22) {
				val = val.slice(1, -1);
			}

			cookieMap.set(key, tryDecode(val));
		}

		index = endIdx + 1;
	}
	return cookieMap;
};

const allSameSite = ["strict", "lax", "none"] as const;
type SameSite = (typeof allSameSite)[number];

function isSameSite(value: string): value is SameSite {
	return allSameSite.includes(value as SameSite);
}


export const SetCookies = (cookieArray: [string], cookies: Cookies) => {
	for (const cookie of cookieArray) {
		const cookieMap = parseCookies(cookie);
		const firstKey = cookieMap.keys().next().value;
		const firstVal = cookieMap.get(firstKey);
		if (firstVal) {
			const maxAgeString = cookieMap.get('Max-Age');
			const maxAge = maxAgeString ? parseInt(maxAgeString, 10) : 31536000;
			const httpOnlyString = cookieMap.get('HttpOnly');
			const httpOnly = httpOnlyString ? JSON.parse(httpOnlyString) : true;
			const sameSite = isSameSite(cookieMap.get('SameSite') ?? 'strict'); 
			cookies.set(firstKey, firstVal, {
				path: cookieMap.get('Path'),
				maxAge: maxAge,
				httpOnly: httpOnly,
				sameSite: sameSite
			});
		}
	}
}
