import { Badge } from "@ctl/ui/components/badge";
import { Button } from "@ctl/ui/components/button";
import { Link } from "@tanstack/react-router";
import {
	ArrowRight,
	CheckCircle2,
	Play,
	Sparkles,
	Terminal,
} from "lucide-react";
import type { ReactNode } from "react";

import { GlowBlob } from "./glow-blob";

export const HeroSection = () => (
	<section className="relative flex min-h-[calc(100svh-56px)] items-center overflow-hidden">
		<DotGridBackground />
		<GlowBlob className="-top-40 left-1/2 -translate-x-1/2" />

		<div className="relative z-10 mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
			<div className="grid items-center gap-12 lg:grid-cols-2">
				<div className="flex flex-col gap-6">
					<Badge
						className="w-fit gap-1.5 border-primary/30 bg-primary/10 text-primary"
						variant="outline"
					>
						<Sparkles className="h-3 w-3" />
						AI-Powered Code Review
					</Badge>

					<h1 className="font-bold text-4xl tracking-tight sm:text-5xl xl:text-6xl">
						Master coding with{" "}
						<span className="bg-linear-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
							real feedback
						</span>
					</h1>

					<p className="max-w-lg text-lg text-muted-foreground leading-relaxed">
						Learn JavaScript, Python, Go and more through hands-on exercises.
						Auto-tests verify your logic. AI analyzes your code and gives you a
						score with actionable feedback.
					</p>

					<div className="flex flex-wrap gap-3">
						<Link to="/auth/sign-in">
							<Button className="gap-2" size="lg">
								Start for free
								<ArrowRight className="h-4 w-4" />
							</Button>
						</Link>
						<Link to={"/courses" as never}>
							<Button className="gap-2" size="lg" variant="outline">
								<Play className="h-4 w-4" />
								Browse courses
							</Button>
						</Link>
					</div>

					<div className="flex items-center gap-6 text-muted-foreground text-sm">
						{["No credit card", "6 languages", "AI feedback"].map((item) => (
							<span className="flex items-center gap-1.5" key={item}>
								<CheckCircle2 className="h-3.5 w-3.5 text-primary" />
								{item}
							</span>
						))}
					</div>
				</div>

				<div className="hidden lg:block">
					<CodeEditorMockup />
				</div>
			</div>
		</div>
	</section>
);

const CodeEditorMockup = () => (
	<div className="relative rotate-1">
		<div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-2xl shadow-black/40">
			<div className="flex items-center gap-1.5 border-border/60 border-b bg-muted/30 px-4 py-3">
				<div className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
				<div className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
				<div className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
				<span className="ml-3 font-mono text-muted-foreground text-xs">
					solution.js
				</span>
			</div>

			<div className="p-5 font-mono text-sm leading-7">
				<CodeLine
					content={
						<span className="text-muted-foreground/50">
							{"// Task: Sum two numbers"}
						</span>
					}
					number="1"
				/>
				<CodeLine content={null} number="2" />
				<CodeLine
					content={
						<span>
							<span className="text-purple-400">const </span>
							<span className="text-blue-300">sum </span>
							<span className="text-foreground/70">= </span>
							<span className="text-yellow-300">{"(a, b)"}</span>
							<span className="text-foreground/70">{" => "}</span>
							<span className="text-foreground">{"{"}</span>
						</span>
					}
					number="3"
				/>
				<CodeLine
					content={
						<span>
							<span className="pl-6 text-purple-400">return </span>
							<span className="text-foreground">a </span>
							<span className="text-cyan-400">+ </span>
							<span className="text-foreground">b</span>
						</span>
					}
					number="4"
				/>
				<CodeLine
					content={<span className="text-foreground">{"}"}</span>}
					number="5"
				/>
				<CodeLine content={null} number="6" />
				<CodeLine
					content={
						<span>
							<span className="text-blue-300">sum</span>
							<span className="text-foreground/70">{"(16, 26)"}</span>
						</span>
					}
					number="7"
				/>
			</div>

			<div className="border-border/60 border-t bg-muted/20 px-5 py-3">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2 font-mono text-muted-foreground text-xs">
						<Terminal className="h-3 w-3" />
						Console: <span className="text-green-400">42</span>
					</div>
					<div className="flex items-center gap-1.5">
						<div className="h-1.5 w-1.5 rounded-full bg-green-400" />
						<span className="text-green-400 text-xs">3/3 tests passed</span>
					</div>
				</div>
			</div>
		</div>

		<div className="absolute -right-3 -bottom-3 -z-10 h-full w-full rounded-xl border border-primary/20 bg-primary/5" />
	</div>
);

const CodeLine = ({
	number,
	content,
}: {
	number: string;
	content: ReactNode;
}) => (
	<div className="flex gap-4">
		<span className="w-4 select-none text-right text-muted-foreground/30">
			{number}
		</span>
		<span>{content}</span>
	</div>
);

const DotGridBackground = () => (
	<div
		className="pointer-events-none absolute inset-0 opacity-[0.35]"
		style={{
			backgroundImage:
				"radial-gradient(circle, oklch(1 0 0 / 0.15) 1px, transparent 1px)",
			backgroundSize: "28px 28px",
		}}
	/>
);
