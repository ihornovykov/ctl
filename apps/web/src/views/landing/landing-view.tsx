import {
	CtaSection,
	FeaturesSection,
	Footer,
	HeroSection,
	HowItWorksSection,
	LanguagesSection,
} from "@/features/landing";

export const LandingView = () => (
	<main className="flex flex-col">
		<HeroSection />
		<LanguagesSection />
		<FeaturesSection />
		<HowItWorksSection />
		<CtaSection />
		<Footer />
	</main>
);
