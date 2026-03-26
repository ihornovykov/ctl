const WHITESPACE = /\s+/;

export const getInitials = (name: string): string => {
	if (!name) {
		return "?";
	}
	const parts = name.trim().split(WHITESPACE);
	if (parts.length === 1) {
		return (parts[0][0] ?? "?").toUpperCase();
	}
	return ((parts[0][0] ?? "") + (parts.at(-1)?.[0] ?? "")).toUpperCase();
};
