import { error, redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import { GetCookieByPrefix } from "$lib/utils";

export const GET = (({ url, request, cookies }) => {
	console.log('self-service/verification ran');
	const flowId = url.searchParams.get('flow') ?? undefined;
	const token = url.searchParams.get('token') ?? undefined;
	const cookieHeader = request.headers.get('cookie') ?? undefined;
		const verificationCookie = GetCookieByPrefix(cookieHeader, {
			prefix: 'verification_csrf_token',
			remove: 'verification_'
		});
		const sessionCookie = cookies.get('ory_kratos_session');
		const cookie =
			typeof verificationCookie === 'string' && typeof sessionCookie === 'string'
				? verificationCookie + sessionCookie
				: undefined;

	if (!flowId || !token) {
		throw error(400, 'Incorrect query parameters');
	}

	const verificationHeaders = cookie ? new Headers({ cookie }) : undefined;
	return fetch(`${env.KRATOS_PUBLIC_URL}/self-service/verification?flow=${flowId}&token=${token}`, {
		headers: verificationHeaders
	}).then(() => {

		throw redirect(303, `/?/verification&flow=${flowId}`);
	});
}) satisfies RequestHandler;
