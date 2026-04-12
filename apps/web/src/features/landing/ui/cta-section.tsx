import { Badge } from "@ctl/ui/components/badge";
import { Button } from "@ctl/ui/components/button";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles } from "lucide-react";

import { GlowBlob } from "./glow-blob";

export const CtaSection = () => (
	<section className="relative overflow-hidden py-28">
		<div className="absolute inset-0 bg-linear-to-br from-primary/20 via-background to-cyan-900/20" />
		<GlowBlob className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-40" />

		<div className="relative z-10 mx-auto max-w-3xl px-4 text-center sm:px-6">
			<Badge
				className="mb-6 gap-1.5 border-primary/30 bg-primary/10 text-primary"
				variant="outline"
			>
				<Sparkles className="h-3 w-3" />
				Free to start
			</Badge>
			<h2 className="font-bold text-4xl tracking-tight sm:text-5xl">
				Start your learning journey today
			</h2>
			<p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
				Join thousands of developers who are improving their code quality with
				structured learning and AI-powered feedback.
			</p>
			<div className="mt-8 flex flex-wrap justify-center gap-4">
				<Link to="/auth/sign-in">
					<Button className="gap-2 px-8" size="lg">
						Get started for free
						<ArrowRight className="h-4 w-4" />
					</Button>
				</Link>
				<Link to={"/courses" as never}>
					<Button className="gap-2 px-8" size="lg" variant="outline">
						Browse all courses
					</Button>
				</Link>
			</div>
		</div>
	</section>
);
