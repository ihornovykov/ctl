import type { PointerEvent as ReactPointerEvent } from "react";
import { useCallback, useMemo, useRef, useState } from "react";

const STORAGE_KEY = "ctl-sandbox-right-panel-pct";

const DEFAULT_RIGHT_PCT = 50;
const ONE_THIRD_PCT = 100 / 3;
const TWO_THIRDS_PCT = (2 * 100) / 3;

export const SANDBOX_MAIN_SPLIT_HANDLE_PX = 6;
const GAP_FALLBACK_PX = 8;

const clampPct = (n: number) =>
	Math.min(TWO_THIRDS_PCT, Math.max(ONE_THIRD_PCT, n));

const readStoredPct = (): number => {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (raw === null) {
			return DEFAULT_RIGHT_PCT;
		}
		const n = Number(raw);
		if (!Number.isFinite(n)) {
			return DEFAULT_RIGHT_PCT;
		}
		return clampPct(n);
	} catch {
		return DEFAULT_RIGHT_PCT;
	}
};

const persistPct = (n: number) => {
	try {
		localStorage.setItem(STORAGE_KEY, String(Math.round(n * 10) / 10));
	} catch {
		/* ignore */
	}
};

const parseColumnGapPx = (rawGap: string): number => {
	const t = rawGap.trim();
	if (t.endsWith("px")) {
		const n = Number.parseFloat(t);
		return Number.isFinite(n) && n >= 0 ? n : GAP_FALLBACK_PX;
	}
	if (t.endsWith("rem")) {
		const n = Number.parseFloat(t);
		const rootPx =
			Number.parseFloat(getComputedStyle(document.documentElement).fontSize) ||
			16;
		return Number.isFinite(n) && n >= 0 ? n * rootPx : GAP_FALLBACK_PX;
	}
	const n = Number.parseFloat(t);
	return Number.isFinite(n) && n > 0 ? n : GAP_FALLBACK_PX;
};

const measureSplitRowFlexWidth = (row: HTMLDivElement): number => {
	const gapPx = parseColumnGapPx(getComputedStyle(row).columnGap);
	const gapTotal = 2 * gapPx;
	return Math.max(
		0,
		row.getBoundingClientRect().width - SANDBOX_MAIN_SPLIT_HANDLE_PX - gapTotal
	);
};

export const useSandboxMainSplit = () => {
	const rowRef = useRef<HTMLDivElement>(null);
	const [rightPanelPercent, setRightPanelPercent] = useState(readStoredPct);

	const onResizeHandlePointerDown = useCallback(
		(event: ReactPointerEvent<HTMLElement>) => {
			event.preventDefault();
			const handle = event.currentTarget;
			handle.setPointerCapture(event.pointerId);

			const startX = event.clientX;
			const startPct = rightPanelPercent;
			let lastPct = startPct;

			const onMove = (ev: PointerEvent) => {
				const row = rowRef.current;
				const flexW = row ? measureSplitRowFlexWidth(row) : 0;
				if (flexW <= 0) {
					return;
				}
				const dx = ev.clientX - startX;
				const next = clampPct(startPct - (dx / flexW) * 100);
				lastPct = next;
				setRightPanelPercent(next);
			};

			const onUp = (ev: PointerEvent) => {
				handle.releasePointerCapture(ev.pointerId);
				window.removeEventListener("pointermove", onMove);
				window.removeEventListener("pointerup", onUp);
				window.removeEventListener("pointercancel", onUp);
				document.body.style.removeProperty("cursor");
				document.body.style.removeProperty("user-select");
				persistPct(lastPct);
			};

			document.body.style.cursor = "col-resize";
			document.body.style.userSelect = "none";
			window.addEventListener("pointermove", onMove);
			window.addEventListener("pointerup", onUp);
			window.addEventListener("pointercancel", onUp);
		},
		[rightPanelPercent]
	);

	const splitGridTemplateColumns = useMemo(
		() =>
			`minmax(0, ${100 - rightPanelPercent}fr) ${SANDBOX_MAIN_SPLIT_HANDLE_PX}px minmax(0, ${rightPanelPercent}fr)`,
		[rightPanelPercent]
	);

	return {
		rowRef,
		rightPanelPercent,
		splitGridTemplateColumns,
		onResizeHandlePointerDown,
	};
};
