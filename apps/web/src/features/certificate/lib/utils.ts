import type { Certificate } from "@ctl/api/routers/courses/validation";

const LANG_ACCENT: Record<
	string,
	{ primary: string; light: string; glow: string }
> = {
	javascript: {
		primary: "#f59e0b",
		light: "#fef3c7",
		glow: "rgba(245,158,11,0.12)",
	},
	typescript: {
		primary: "#3b82f6",
		light: "#dbeafe",
		glow: "rgba(59,130,246,0.12)",
	},
	go: { primary: "#06b6d4", light: "#cffafe", glow: "rgba(6,182,212,0.12)" },
	python: {
		primary: "#22c55e",
		light: "#dcfce7",
		glow: "rgba(34,197,94,0.12)",
	},
	c: { primary: "#94a3b8", light: "#f1f5f9", glow: "rgba(148,163,184,0.12)" },
	cpp: { primary: "#8b5cf6", light: "#ede9fe", glow: "rgba(139,92,246,0.12)" },
};

const DEFAULT_ACCENT = {
	primary: "#0891b2",
	light: "#cffafe",
	glow: "rgba(8,145,178,0.12)",
};

const MONTHS = [
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
];

const fmtDate = (d: Date) =>
	`${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;

export const buildCertificateHtml = (cert: Certificate): string => {
	const a = LANG_ACCENT[cert.languageId] ?? DEFAULT_ACCENT;
	const date = fmtDate(new Date(cert.completedAt));
	const level =
		cert.difficulty.charAt(0).toUpperCase() + cert.difficulty.slice(1);

	const iconImg = cert.languageIcon
		? `<img src="${cert.languageIcon}" alt="${cert.languageName}" width="28" height="28" style="vertical-align:middle">`
		: "";

	return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Certificate — ${cert.courseTitle}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      background: #e8ecf0;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      padding: 32px 24px 48px;
      font-family: 'Geist', 'Inter', system-ui, sans-serif;
    }

    .toolbar {
      width: 100%;
      max-width: 1122px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
      gap: 12px;
    }
    .toolbar-title {
      font-size: 14px;
      font-weight: 600;
      color: #475569;
      letter-spacing: 0.01em;
    }
    .toolbar-actions { display: flex; gap: 10px; }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 18px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: opacity .15s;
      text-decoration: none;
    }
    .btn:hover { opacity: .85; }
    .btn-primary { background: ${a.primary}; color: #fff; }
    .btn-outline { background: #fff; color: #334155; border: 1.5px solid #cbd5e1; }

    .cert {
      width: 1122px;
      height: 794px;
      position: relative;
      overflow: hidden;
      background: linear-gradient(135deg, #fafcff 0%, #f0f7ff 50%, #fafcff 100%);
      box-shadow: 0 8px 48px rgba(0,0,0,.18);
      border-radius: 6px;
    }

    .cert-glow {
      position: absolute; inset: 0; pointer-events: none;
      background: radial-gradient(ellipse 700px 500px at 50% 50%, ${a.glow}, transparent 70%);
    }

    .cert-border-outer {
      position: absolute; inset: 24px;
      border: 2px solid ${a.primary};
      border-radius: 4px; opacity: .3; pointer-events: none;
    }
    .cert-border-inner {
      position: absolute; inset: 32px;
      border: 1px solid ${a.primary};
      border-radius: 2px; opacity: .15; pointer-events: none;
    }

    .cert-stripe {
      position: absolute; top: 0; left: 50%; transform: translateX(-50%);
      width: 200px; height: 3px;
      background: linear-gradient(to right, transparent, ${a.primary}, transparent);
      opacity: .8;
    }

    .corner { position: absolute; width: 90px; height: 90px; }
    .corner-tl { top: 0; left: 0; }
    .corner-tr { top: 0; right: 0; transform: scaleX(-1); }
    .corner-bl { bottom: 0; left: 0; transform: scaleY(-1); }
    .corner-br { bottom: 0; right: 0; transform: scale(-1); }

    .cert-body {
      position: relative; z-index: 1;
      width: 100%; height: 100%;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      text-align: center; padding: 0 80px;
    }

    .brand-row {
      display: flex; align-items: center; gap: 8px; margin-bottom: 18px;
    }
    .brand-line { width: 40px; height: 1px; background: ${a.primary}; opacity: .6; }
    .brand-name {
      font-size: 11px; letter-spacing: 4px; text-transform: uppercase;
      color: ${a.primary}; font-weight: 600;
    }

    h1 {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 48px; font-weight: 700;
      color: #0f172a; letter-spacing: -.5px; line-height: 1.1;
      margin-bottom: 4px;
    }

    .divider {
      display: flex; align-items: center; gap: 12px;
      margin: 14px 0;
    }
    .divider-line-l { width: 120px; height: 1px; background: linear-gradient(to right, transparent, ${a.primary}); }
    .divider-line-r { width: 120px; height: 1px; background: linear-gradient(to left,  transparent, ${a.primary}); }

    .sub-italic {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 14px; font-style: italic; color: #64748b; margin-bottom: 8px;
    }

    .recipient-name {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 42px; font-weight: 700;
      color: ${a.primary}; letter-spacing: -.5px; line-height: 1.15;
      margin-bottom: 8px;
    }

    .course-pill {
      display: inline-flex; align-items: center; gap: 10px;
      background: ${a.light};
      border: 1px solid ${a.primary};
      border-radius: 8px;
      padding: 10px 24px;
      margin-bottom: 18px;
    }
    .course-title {
      font-size: 20px; font-weight: 700; color: #0f172a; letter-spacing: -.3px;
    }

    .meta-row {
      display: flex; align-items: center; gap: 28px;
    }
    .meta-item { text-align: center; }
    .meta-label {
      font-size: 10px; color: #94a3b8; letter-spacing: 2px;
      text-transform: uppercase; margin-bottom: 3px;
    }
    .meta-value { font-size: 14px; font-weight: 600; color: #334155; }
    .meta-value.mono { font-family: monospace; font-size: 11px; color: #94a3b8; }
    .meta-sep { width: 1px; height: 32px; background: #e2e8f0; }

    .wave { position: absolute; bottom: 0; left: 0; pointer-events: none; }

    @media print {
      body { background: white; padding: 0; }
      .toolbar { display: none !important; }
      .cert {
        box-shadow: none; border-radius: 0;
        width: 100vw; height: 100vh;
      }
    }

    @page { size: A4 landscape; margin: 0; }
  </style>
</head>
<body>

  <div class="toolbar">
    <span class="toolbar-title">Certificate of Completion — ${cert.courseTitle}</span>
    <div class="toolbar-actions">
      <button class="btn btn-outline" onclick="window.close()">✕ Close</button>
      <button class="btn btn-primary" onclick="window.print()">⬇ Save as PDF</button>
    </div>
  </div>

  <div class="cert">
    <div class="cert-glow"></div>
    <div class="cert-border-outer"></div>
    <div class="cert-border-inner"></div>
    <div class="cert-stripe"></div>

    <svg class="corner corner-tl" viewBox="0 0 90 90">
      <path d="M 8 8 L 8 36 M 8 8 L 36 8" stroke="${a.primary}" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M 16 16 L 16 30 M 16 16 L 30 16" stroke="${a.primary}" stroke-width="1.5" fill="none" stroke-linecap="round" opacity=".5"/>
      <circle cx="8" cy="8" r="3" fill="${a.primary}" opacity=".8"/>
    </svg>
    <svg class="corner corner-tr" viewBox="0 0 90 90">
      <path d="M 8 8 L 8 36 M 8 8 L 36 8" stroke="${a.primary}" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M 16 16 L 16 30 M 16 16 L 30 16" stroke="${a.primary}" stroke-width="1.5" fill="none" stroke-linecap="round" opacity=".5"/>
      <circle cx="8" cy="8" r="3" fill="${a.primary}" opacity=".8"/>
    </svg>
    <svg class="corner corner-bl" viewBox="0 0 90 90">
      <path d="M 8 8 L 8 36 M 8 8 L 36 8" stroke="${a.primary}" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M 16 16 L 16 30 M 16 16 L 30 16" stroke="${a.primary}" stroke-width="1.5" fill="none" stroke-linecap="round" opacity=".5"/>
      <circle cx="8" cy="8" r="3" fill="${a.primary}" opacity=".8"/>
    </svg>
    <svg class="corner corner-br" viewBox="0 0 90 90">
      <path d="M 8 8 L 8 36 M 8 8 L 36 8" stroke="${a.primary}" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M 16 16 L 16 30 M 16 16 L 30 16" stroke="${a.primary}" stroke-width="1.5" fill="none" stroke-linecap="round" opacity=".5"/>
      <circle cx="8" cy="8" r="3" fill="${a.primary}" opacity=".8"/>
    </svg>

    <svg class="wave" width="1122" height="60" viewBox="0 0 1122 60" preserveAspectRatio="none">
      <path d="M 0 60 Q 280 20 560 40 Q 840 60 1122 30 L 1122 60 Z" fill="${a.primary}" opacity=".08"/>
    </svg>
    <svg class="wave" width="1122" height="40" viewBox="0 0 1122 40" preserveAspectRatio="none">
      <path d="M 0 40 Q 200 10 400 25 Q 600 40 800 20 Q 1000 5 1122 25 L 1122 40 Z" fill="${a.primary}" opacity=".06"/>
    </svg>

    <div class="cert-body">
      <div class="brand-row">
        <div class="brand-line"></div>
        <span class="brand-name">CodeLearn</span>
        <div class="brand-line"></div>
      </div>

      <h1>Certificate of Completion</h1>

      <div class="divider">
        <div class="divider-line-l"></div>
        <svg width="20" height="20" viewBox="0 0 20 20">
          <polygon points="10,2 12.5,7.5 18,8 14,12 15,18 10,15 5,18 6,12 2,8 7.5,7.5" fill="${a.primary}" opacity=".8"/>
        </svg>
        <div class="divider-line-r"></div>
      </div>

      <p class="sub-italic">This certifies that</p>
      <div class="recipient-name">${cert.userName}</div>
      <p class="sub-italic">has successfully completed</p>

      <div class="course-pill">
        ${iconImg}
        <span class="course-title">${cert.courseTitle}</span>
      </div>

      <div class="meta-row">
        <div class="meta-item">
          <div class="meta-label">Completed</div>
          <div class="meta-value">${date}</div>
        </div>
        <div class="meta-sep"></div>
        <div class="meta-item">
          <div class="meta-label">Level</div>
          <div class="meta-value">${level}</div>
        </div>
        <div class="meta-sep"></div>
        <div class="meta-item">
          <div class="meta-label">Duration</div>
          <div class="meta-value">${cert.estimatedHours}h</div>
        </div>
        <div class="meta-sep"></div>
        <div class="meta-item">
          <div class="meta-label">Certificate ID</div>
          <div class="meta-value mono">${cert.certificateId}</div>
        </div>
      </div>
    </div>
  </div>

</body>
</html>`;
};
