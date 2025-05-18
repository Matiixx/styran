import Link from "next/link";
import Image from "next/image";

import {
  ArrowRight,
  BarChart2,
  Calendar,
  CheckCircle,
  Clock,
  LineChart,
  Link2,
  Settings,
  Users,
} from "lucide-react";

import { auth } from "~/server/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Header } from "./_components/header";
import { map } from "lodash";

export const metadata = {
  title: "Styran - #1 Project Management Tool",
};

export default async function Home() {
  return (
    <div className="flex h-screen w-full flex-col overflow-hidden">
      <Header />
      <div className="flex-1 overflow-y-auto">
        <div className="flex w-full flex-col items-center px-4 py-16 pt-24">
          <div className="flex max-w-screen-2xl flex-col items-center gap-4">
            <Hero />

            <Features />

            <HowItWorks />

            <Pricing />
          </div>
        </div>
      </div>
    </div>
  );
}

const Hero = async () => {
  const session = await auth();

  return (
    <div className="my-36 flex flex-col items-center gap-8 px-12 xl:flex-row xl:gap-4">
      <div className="flex flex-1 flex-col gap-4">
        <h1 className="mb-6 text-4xl font-bold md:text-5xl lg:text-6xl">
          Manage Projects <span className="text-purple-700">Effortlessly</span>
        </h1>

        <span className="text-lg text-gray-600">
          Styran helps teams track projects, manage resources, and deliver
          results on time. Streamline your workflow and boost productivity.
        </span>

        <div className="mt-8 flex flex-row gap-4">
          {session?.user ? (
            <>
              <Link href="/projects">
                <Button className="px-8 py-6">
                  Get Started <ArrowRight />
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button className="px-8 py-6" variant="outline">
                  See how it works
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/api/auth/register">
                <Button className="px-8 py-6">
                  Get Started <ArrowRight />
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button className="px-8 py-6" variant="outline">
                  See how it works
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="relative flex-1">
        <div className="relative z-10 overflow-hidden rounded-lg border border-border bg-background shadow-xl">
          <div className="bg-muted p-1">
            <div className="flex space-x-1.5">
              <div className="h-3 w-3 rounded-full bg-red-500"></div>
              <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
            </div>
          </div>
          <div className="p-4">
            <Image
              src="https://kf9zqq869t.ufs.sh/f/UXq6fJAGg0ksa5HUXgnwUrjWuRN3c5vzyk4816q9HfGlOeDp"
              alt="Styran Dashboard Preview"
              height={725}
              width={1686}
              className="rounded border border-border"
            />
          </div>
        </div>

        <div className="absolute -bottom-2 -left-2 h-20 w-20 rounded-full bg-primary/10"></div>
        <div className="absolute -right-6 -top-6 h-40 w-40 rounded-full bg-primary/10"></div>
      </div>
    </div>
  );
};

const FEATURES = [
  {
    icon: BarChart2,
    title: "Resource Tracking",
    description:
      "Effortlessly monitor resource utilization and optimize your team's productivity with visual analytics.",
  },
  {
    icon: Calendar,
    title: "Project Timeline",
    description:
      "Visualize your project timeline with a clear, interactive Gantt chart. Track progress, deadlines, burndown charts and resource allocation at a glance.",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description:
      "Seamless communication and file sharing for distributed teams.",
  },
  {
    icon: CheckCircle,
    title: "Task Management",
    description:
      "Create and manage tasks with ease. Assign responsibilities, set priorities, and track progress to ensure projects stay on schedule.",
  },
  {
    icon: Clock,
    title: "Time Tracking",
    description:
      "Accurately track time spent on tasks and projects. Generate detailed reports to optimize resource allocation and improve project management.",
  },
  {
    icon: Settings,
    title: "Customizable",
    description:
      "Tailor Styran to your team's needs. Add custom fields, task types, and workflows to streamline your workflow.",
  },
  {
    icon: Link2,
    title: "Integrations",
    description:
      "Connect Styran with your favorite tools. Integrate with Google Calendar, Discord, and more to streamline your workflow.",
  },
  {
    icon: LineChart,
    title: "Analytics & Reporting",
    description:
      "Gain valuable insights with customizable dashboards and reports. Track KPIs, identify trends, and make data-driven decisions to improve project outcomes.",
  },
];

const Features = () => {
  const FeatureIcon = ({ icon: Icon }: { icon: React.ElementType }) => (
    <Icon className="h-10 w-10 text-purple-700" />
  );

  return (
    <div className="grid grid-cols-1 gap-4 py-24 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {FEATURES.map((feature) => (
        <Card key={feature.title} className="w-full">
          <CardHeader>
            <CardTitle className="flex flex-col gap-4">
              <FeatureIcon icon={feature.icon} />
              <h2>{feature.title}</h2>
            </CardTitle>
          </CardHeader>
          <CardDescription>{feature.description}</CardDescription>
        </Card>
      ))}
    </div>
  );
};

const HOW_IT_WORKS = [
  {
    title: "Create a Project",
    description:
      "Set up projects, define milestones, and invite team members to collaborate.",
  },
  {
    title: "Create and assign duties",
    description:
      "Break down projects into manageable assignments, ie. tasks, meetings, events, etc. Assign responsibilities, set priorities, and track progress.",
  },
  {
    title: "Monitor & Collaborate",
    description:
      "Track progress in real-time, communicate with team members, and manage resources effectively.",
  },
  {
    title: "Analyze & Report",
    description:
      "Generate insights from project data, create reports, and identify areas for improvement.",
  },
  {
    title: "Review & Optimize",
    description:
      "Conduct project retrospectives, gather feedback, and implement improvements for future projects.",
  },
];

const HowItWorks = () => {
  return (
    <div
      className="flex flex-col items-center gap-8 px-12 py-24"
      id="how-it-works"
    >
      <h2 className="text-3xl font-bold">How It Works</h2>

      <div className="flex flex-col gap-8 md:flex-row">
        {HOW_IT_WORKS.map((step, stepIndex) => (
          <div
            key={step.title}
            className="flex max-w-72 flex-1 flex-col items-center gap-2"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-700 text-2xl font-bold text-white">
              {stepIndex + 1}
            </div>
            <h3 className="text-center text-xl font-bold">{step.title}</h3>
            <span className="text-center text-sm text-gray-600">
              {step.description}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const PRICING_FEATURES = [
  "Unlimited projects and tasks",
  "Unlimited team members",
  "Real-time collaboration",
  "Project timeline & Gantt charts",
  "Resource tracking & analytics",
  "Task management & assignments",
  "Time tracking & reporting",
  "Team communication tools",
  "Customizable workflows",
  "Integration capabilities",
  "24/7 support access",
];

const Pricing = () => {
  return (
    <div className="flex flex-col items-center gap-8 px-12 py-24">
      <h2 className="text-3xl font-bold">Simple, Transparent Pricing</h2>

      <Card className="w-80 border-purple-700">
        <CardHeader>
          <CardTitle>Free</CardTitle>
          <div>
            <span className="text-xl font-bold">0$</span>/month
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {map(PRICING_FEATURES, (feature) => (
              <li key={feature} className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-purple-700" />
                {feature}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
