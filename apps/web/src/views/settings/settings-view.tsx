import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@ctl/ui/components/tabs";
import { cn } from "@ctl/ui/lib/utils";
import { IconShieldLock, IconTrash, IconUser } from "@tabler/icons-react";
import { motion } from "motion/react";
import { useState } from "react";
import {
	SettingsAccountsSection,
	SettingsDangerZone,
	SettingsPasswordSection,
	SettingsProfileSection,
} from "@/features/settings";

type SettingsTab = "profile" | "security" | "danger";

const tabPanelClass = cn(
	"col-start-1 row-start-1 mt-0 w-full max-w-full text-sm outline-none"
);

const springPanel = {
	type: "spring" as const,
	stiffness: 420,
	damping: 36,
	mass: 0.65,
};

export const SettingsView = () => {
	const [tab, setTab] = useState<SettingsTab>("profile");

	return (
		<div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
			<header className="mb-8 lg:mb-10">
				<h1 className="font-bold text-3xl tracking-tight">Settings</h1>
				<p className="mt-1 text-muted-foreground">
					Configure your profile, sign-in methods, and account security.
				</p>
			</header>

			<Tabs
				className="flex flex-col gap-5 lg:flex-row lg:items-start lg:gap-8"
				onValueChange={(v) => setTab(v as SettingsTab)}
				orientation="vertical"
				value={tab}
			>
				<TabsList
					className="h-fit w-full shrink-0 bg-transparent p-0 lg:w-48"
					variant="line"
				>
					<TabsTrigger className="justify-start gap-2" value="profile">
						<IconUser className="size-4" />
						Profile
					</TabsTrigger>
					<TabsTrigger className="justify-start gap-2" value="security">
						<IconShieldLock className="size-4" />
						Security
					</TabsTrigger>
					<TabsTrigger className="justify-start gap-2" value="danger">
						<IconTrash className="size-4" />
						Danger zone
					</TabsTrigger>
				</TabsList>

				<div className="grid min-w-0 flex-1 grid-cols-1 grid-rows-1 place-items-stretch">
					<TabsContent className={tabPanelClass} keepMounted value="profile">
						{tab === "profile" ? (
							<motion.div
								animate={{ filter: "blur(0px)", opacity: 1, x: 0 }}
								initial={{ filter: "blur(10px)", opacity: 0, x: 18 }}
								key="profile-panel"
								transition={springPanel}
							>
								<SettingsProfileSection />
							</motion.div>
						) : null}
					</TabsContent>
					<TabsContent className={tabPanelClass} keepMounted value="security">
						{tab === "security" ? (
							<motion.div
								animate={{ filter: "blur(0px)", opacity: 1, x: 0 }}
								initial={{ filter: "blur(10px)", opacity: 0, x: 18 }}
								key="security-panel"
								transition={springPanel}
							>
								<div className="flex flex-col gap-8">
									<SettingsAccountsSection />
									<SettingsPasswordSection />
								</div>
							</motion.div>
						) : null}
					</TabsContent>
					<TabsContent className={tabPanelClass} keepMounted value="danger">
						{tab === "danger" ? (
							<motion.div
								animate={{ filter: "blur(0px)", opacity: 1, x: 0 }}
								initial={{ filter: "blur(10px)", opacity: 0, x: 18 }}
								key="danger-panel"
								transition={springPanel}
							>
								<SettingsDangerZone />
							</motion.div>
						) : null}
					</TabsContent>
				</div>
			</Tabs>
		</div>
	);
};
