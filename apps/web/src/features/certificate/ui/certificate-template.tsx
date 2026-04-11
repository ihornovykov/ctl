import type { Certificate } from "@ctl/api/routers/courses/validation";
import { forwardRef } from "react";

import {
	CERTIFICATE_DEFAULT_LANG_ACCENT,
	CERTIFICATE_LANG_ACCENT,
} from "../lib/constants";
import { formatCertificateLongDate } from "../lib/utils";

type Props = {
	certificate: Certificate;
};

export const CertificateTemplate = forwardRef<HTMLDivElement, Props>(
	({ certificate }, ref) => {
		const accent =
			CERTIFICATE_LANG_ACCENT[certificate.languageId] ??
			CERTIFICATE_DEFAULT_LANG_ACCENT;
		const formattedDate = formatCertificateLongDate(
			new Date(certificate.completedAt)
		);

		const difficultyLabel =
			certificate.difficulty.charAt(0).toUpperCase() +
			certificate.difficulty.slice(1);

		return (
			<div
				ref={ref}
				style={{
					width: "1122px",
					height: "794px",
					position: "relative",
					background:
						"linear-gradient(135deg, #fafcff 0%, #f0f7ff 50%, #fafcff 100%)",
					fontFamily: "'Geist', 'Inter', sans-serif",
					overflow: "hidden",
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				<style>{`
					@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');
				`}</style>

				<div
					style={{
						position: "absolute",
						top: "50%",
						left: "50%",
						transform: "translate(-50%, -50%)",
						width: "700px",
						height: "500px",
						borderRadius: "50%",
						background: accent.glow,
						filter: "blur(80px)",
						pointerEvents: "none",
					}}
				/>

				{[
					{ top: 0, left: 0, transform: "none" },
					{ top: 0, right: 0, transform: "scaleX(-1)" },
					{ bottom: 0, left: 0, transform: "scaleY(-1)" },
					{ bottom: 0, right: 0, transform: "scale(-1)" },
				].map((pos, i) => (
					<svg
						aria-label="Geometric corner accent"
						height="90"
						key={`corner-accent-${i.toString()}`}
						style={{ position: "absolute", ...pos }}
						viewBox="0 0 90 90"
						width="90"
					>
						<path
							d="M 8 8 L 8 36 M 8 8 L 36 8"
							fill="none"
							stroke={accent.primary}
							strokeLinecap="round"
							strokeWidth="3"
						/>
						<path
							d="M 16 16 L 16 30 M 16 16 L 30 16"
							fill="none"
							opacity="0.5"
							stroke={accent.primary}
							strokeLinecap="round"
							strokeWidth="1.5"
						/>
						<circle cx="8" cy="8" fill={accent.primary} opacity="0.8" r="3" />
					</svg>
				))}

				<div
					style={{
						position: "absolute",
						inset: "24px",
						border: `2px solid ${accent.primary}`,
						borderRadius: "4px",
						opacity: 0.3,
						pointerEvents: "none",
					}}
				/>

				<div
					style={{
						position: "absolute",
						inset: "32px",
						border: `1px solid ${accent.primary}`,
						borderRadius: "2px",
						opacity: 0.15,
						pointerEvents: "none",
					}}
				/>

				<div
					style={{
						position: "relative",
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						textAlign: "center",
						padding: "0 80px",
						gap: "0",
						zIndex: 1,
					}}
				>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							gap: "8px",
							marginBottom: "20px",
						}}
					>
						<div
							style={{
								width: "40px",
								height: "1px",
								background: accent.primary,
								opacity: 0.6,
							}}
						/>
						<span
							style={{
								fontSize: "11px",
								letterSpacing: "4px",
								textTransform: "uppercase",
								color: accent.primary,
								fontWeight: 600,
							}}
						>
							CodeLearn
						</span>
						<div
							style={{
								width: "40px",
								height: "1px",
								background: accent.primary,
								opacity: 0.6,
							}}
						/>
					</div>

					<h1
						style={{
							fontFamily: "'Playfair Display', Georgia, serif",
							fontSize: "48px",
							fontWeight: 700,
							color: "#0f172a",
							letterSpacing: "-0.5px",
							lineHeight: 1.1,
							margin: 0,
							marginBottom: "6px",
						}}
					>
						Certificate of Completion
					</h1>

					<div
						style={{
							display: "flex",
							alignItems: "center",
							gap: "12px",
							margin: "16px 0",
						}}
					>
						<div
							style={{
								width: "120px",
								height: "1px",
								background: `linear-gradient(to right, transparent, ${accent.primary})`,
							}}
						/>
						<svg
							aria-label="Star icon"
							height="20"
							viewBox="0 0 20 20"
							width="20"
						>
							<polygon
								fill={accent.primary}
								opacity="0.8"
								points="10,2 12.5,7.5 18,8 14,12 15,18 10,15 5,18 6,12 2,8 7.5,7.5"
							/>
						</svg>
						<div
							style={{
								width: "120px",
								height: "1px",
								background: `linear-gradient(to left, transparent, ${accent.primary})`,
							}}
						/>
					</div>

					<p
						style={{
							fontFamily: "'Playfair Display', Georgia, serif",
							fontSize: "14px",
							fontStyle: "italic",
							color: "#64748b",
							margin: "0 0 10px",
						}}
					>
						This certifies that
					</p>

					<div
						style={{
							fontFamily: "'Playfair Display', Georgia, serif",
							fontSize: "42px",
							fontWeight: 700,
							color: accent.primary,
							letterSpacing: "-0.5px",
							lineHeight: 1.15,
							marginBottom: "10px",
						}}
					>
						{certificate.userName}
					</div>

					<p
						style={{
							fontFamily: "'Playfair Display', Georgia, serif",
							fontSize: "14px",
							fontStyle: "italic",
							color: "#64748b",
							margin: "0 0 12px",
						}}
					>
						has successfully completed
					</p>

					<div
						style={{
							display: "flex",
							alignItems: "center",
							gap: "12px",
							background: accent.light,
							border: `1px solid ${accent.primary}`,
							borderRadius: "8px",
							padding: "10px 24px",
							marginBottom: "20px",
						}}
					>
						{certificate.languageIcon && (
							<img
								alt={certificate.languageName}
								crossOrigin="anonymous"
								src={certificate.languageIcon}
								style={{ width: "28px", height: "28px" }}
							/>
						)}
						<span
							style={{
								fontSize: "20px",
								fontWeight: 700,
								color: "#0f172a",
								letterSpacing: "-0.3px",
							}}
						>
							{certificate.courseTitle}
						</span>
					</div>

					<div
						style={{
							display: "flex",
							alignItems: "center",
							gap: "32px",
							marginTop: "4px",
						}}
					>
						<div style={{ textAlign: "center" }}>
							<div
								style={{
									fontSize: "10px",
									color: "#94a3b8",
									letterSpacing: "2px",
									textTransform: "uppercase",
									marginBottom: "3px",
								}}
							>
								Completed
							</div>
							<div
								style={{ fontSize: "14px", fontWeight: 600, color: "#334155" }}
							>
								{formattedDate}
							</div>
						</div>
						<div
							style={{ width: "1px", height: "32px", background: "#e2e8f0" }}
						/>
						<div style={{ textAlign: "center" }}>
							<div
								style={{
									fontSize: "10px",
									color: "#94a3b8",
									letterSpacing: "2px",
									textTransform: "uppercase",
									marginBottom: "3px",
								}}
							>
								Level
							</div>
							<div
								style={{ fontSize: "14px", fontWeight: 600, color: "#334155" }}
							>
								{difficultyLabel}
							</div>
						</div>
						<div
							style={{ width: "1px", height: "32px", background: "#e2e8f0" }}
						/>
						<div style={{ textAlign: "center" }}>
							<div
								style={{
									fontSize: "10px",
									color: "#94a3b8",
									letterSpacing: "2px",
									textTransform: "uppercase",
									marginBottom: "3px",
								}}
							>
								Duration
							</div>
							<div
								style={{ fontSize: "14px", fontWeight: 600, color: "#334155" }}
							>
								{certificate.estimatedHours}h
							</div>
						</div>
						<div
							style={{ width: "1px", height: "32px", background: "#e2e8f0" }}
						/>
						<div style={{ textAlign: "center" }}>
							<div
								style={{
									fontSize: "10px",
									color: "#94a3b8",
									letterSpacing: "2px",
									textTransform: "uppercase",
									marginBottom: "3px",
								}}
							>
								Certificate ID
							</div>
							<div
								style={{
									fontSize: "11px",
									fontWeight: 600,
									color: "#94a3b8",
									fontFamily: "monospace",
								}}
							>
								{certificate.certificateId}
							</div>
						</div>
					</div>
				</div>

				<svg
					aria-label="Bottom wave decoration"
					height="60"
					preserveAspectRatio="none"
					style={{ position: "absolute", bottom: 0, left: 0 }}
					viewBox="0 0 1122 60"
					width="1122"
				>
					<path
						d="M 0 60 Q 280 20 560 40 Q 840 60 1122 30 L 1122 60 Z"
						fill={accent.primary}
						opacity="0.08"
					/>
				</svg>
				<svg
					aria-label="Bottom wave decoration"
					height="40"
					preserveAspectRatio="none"
					style={{ position: "absolute", bottom: 0, left: 0 }}
					viewBox="0 0 1122 40"
					width="1122"
				>
					<path
						d="M 0 40 Q 200 10 400 25 Q 600 40 800 20 Q 1000 5 1122 25 L 1122 40 Z"
						fill={accent.primary}
						opacity="0.06"
					/>
				</svg>

				<div
					style={{
						position: "absolute",
						top: 0,
						left: "50%",
						transform: "translateX(-50%)",
						width: "200px",
						height: "3px",
						background: `linear-gradient(to right, transparent, ${accent.primary}, transparent)`,
						opacity: 0.8,
					}}
				/>
			</div>
		);
	}
);

CertificateTemplate.displayName = "CertificateTemplate";
