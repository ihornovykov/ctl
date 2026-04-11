import {
	DASHBOARD_CHART_DEFAULT_COLOR,
	DASHBOARD_CHART_LANG_COLOR,
	DASHBOARD_SHORT_MONTH_NAMES,
} from "./constants";

export const formatDashboardShortDate = (d: Date) => {
	const date = new Date(d);
	return `${DASHBOARD_SHORT_MONTH_NAMES[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
};

export const formatDashboardMemberSince = (d: Date) =>
	`${DASHBOARD_SHORT_MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;

export const getDashboardChartLangColor = (id: string) =>
	DASHBOARD_CHART_LANG_COLOR[id] ?? DASHBOARD_CHART_DEFAULT_COLOR;
