export type CertificateLangAccent = {
	primary: string;
	light: string;
	glow: string;
};

export const CERTIFICATE_LANG_ACCENT: Record<string, CertificateLangAccent> = {
	javascript: {
		primary: "#f59e0b",
		light: "#fef3c7",
		glow: "rgba(245,158,11,0.15)",
	},
	typescript: {
		primary: "#3b82f6",
		light: "#dbeafe",
		glow: "rgba(59,130,246,0.15)",
	},
	go: { primary: "#06b6d4", light: "#cffafe", glow: "rgba(6,182,212,0.15)" },
	python: {
		primary: "#22c55e",
		light: "#dcfce7",
		glow: "rgba(34,197,94,0.15)",
	},
	c: { primary: "#94a3b8", light: "#f1f5f9", glow: "rgba(148,163,184,0.15)" },
	cpp: { primary: "#8b5cf6", light: "#ede9fe", glow: "rgba(139,92,246,0.15)" },
	react: {
		primary: "#0ea5e9",
		light: "#e0f2fe",
		glow: "rgba(14,165,233,0.15)",
	},
	vue: {
		primary: "#10b981",
		light: "#d1fae5",
		glow: "rgba(16,185,129,0.15)",
	},
};

export const CERTIFICATE_DEFAULT_LANG_ACCENT: CertificateLangAccent = {
	primary: "#0891b2",
	light: "#cffafe",
	glow: "rgba(8,145,178,0.15)",
};

export const CERTIFICATE_LONG_MONTH_NAMES = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
] as const;
