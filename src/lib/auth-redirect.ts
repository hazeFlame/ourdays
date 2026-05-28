export function getSafeAuthRedirect(value: string | string[] | null | undefined) {
	const redirectTo = Array.isArray(value) ? value[0] : value;

	if (!redirectTo || !redirectTo.startsWith("/") || redirectTo.startsWith("//")) {
		return "/";
	}

	return redirectTo;
}
