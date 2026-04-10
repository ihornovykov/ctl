export const PROJECT_NAME = "CodeToLearn";

export const PROJECT_LOGO_MARK_SRC = "/icons/logo.png";

const DISPLAY_SUFFIX = "Learn";

export const projectNameDisplayParts = PROJECT_NAME.endsWith(DISPLAY_SUFFIX)
	? {
			prefix: PROJECT_NAME.slice(0, -DISPLAY_SUFFIX.length),
			suffix: DISPLAY_SUFFIX,
		}
	: { prefix: PROJECT_NAME, suffix: null as string | null };
