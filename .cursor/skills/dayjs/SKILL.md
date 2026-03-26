---
name: dayjs
description: Prefer Day.js for all date and time manipulation (parsing, formatting, arithmetic, comparisons, ranges, time zones) instead of custom utilities, built-in Date math, or other date libraries. Use when working with dates, times, or time ranges, or when the user mentions formatting dates, computing ranges, or handling time zones.
---

# Day.js

Always use **Day.js** to work with dates and times. Avoid ad‑hoc `Date` math, manual string manipulation, or adding new date libraries.

## When to use

- Parsing or formatting dates/times
- Adding or subtracting days, months, or other units
- Comparing dates (before/after, same day, within range)
- Building calendar views and date filters
- Converting between `Date` objects and ISO strings

## Setup

```bash
pnpm add dayjs
```

```typescript
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import customParseFormat from "dayjs/plugin/customParseFormat";
import isBetween from "dayjs/plugin/isBetween";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(advancedFormat);
dayjs.extend(customParseFormat);
dayjs.extend(isBetween);
dayjs.extend(utc);
dayjs.extend(timezone);
```

## Parsing and formatting

Prefer Day.js parsing and `format` instead of manual string slicing or `toLocaleString`.

```typescript
enum DateFormat {
  ISO_DATE = "YYYY-MM-DD", // 2024-03-10
  ISO_DATE_TIME = "YYYY-MM-DDTHH:mm:ss[Z]", // 2024-03-10T12:00:00Z
  DD_MM_YYYY = "DD/MM/YYYY", // 10/03/2024
  READABLE_DATE = "dddd, MMMM D, YYYY", // Sunday, March 10, 2024
}

const date = dayjs("2024-03-10T12:00:00Z");

const label = date.format(DateFormat.ISO_DATE);
const longLabel = date.format(DateFormat.READABLE_DATE)
```

For strict parsing of non-ISO formats, use `customParseFormat` and pass `true` for strict mode.

```typescript
const parsed = dayjs("10/03/2024", DateFormat.DD_MM_YYYY, true);
if (!parsed.isValid()) throw new Error("Invalid date");
```

For date-only strings that must be treated as UTC, normalize at the edges and document it in a shared helper.

## Arithmetic

Use Day.js helpers for arithmetic instead of mutating `Date` or doing timestamp math by hand.

```typescript
const start = dayjs();
const inSevenDays = start.add(7, "day");
const lastMonth = start.subtract(1, "month");

const minutes = dayjs("2024-03-10T12:30Z").diff(dayjs("2024-03-10T12:00Z"), "minute");
```

## Comparisons and ranges

Use comparison helpers for clarity.

```typescript
const isPast = dayjs(targetDate).isBefore(dayjs());
const sameDay = dayjs(a).isSame(dayjs(b), "day");

const isWithinRange = dayjs(date).isBetween(rangeStart, rangeEnd, null, "[]"); // inclusive
```

## Time zones

If you need time zone support, use the `utc` + `timezone` plugins and keep time zone conversions at the edges:

```typescript
const tz = "Europe/Kyiv";
const local = dayjs.tz("2024-03-10 12:00", "YYYY-MM-DD HH:mm", tz);
const asUtcIso = local.utc().toISOString();
```

Keep all date parsing/normalization in a small set of helpers instead of scattered `new Date(...)` calls.

## Rules

- Prefer Day.js helpers over manual `Date` arithmetic or string formatting.
- Do not introduce other date libraries (Moment, Luxon, date-fns, etc.).
- Centralize date utilities in shared modules so behavior (especially time zones) is consistent.

