import { StepTask } from "@/types/maintenance";
import {
  Wrench,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChartNoAxesCombined,
} from "lucide-react";

interface StatsBarProps {
  tasks: StepTask[];
}

export function StatsBar({ tasks }: StatsBarProps) {
  const totalTasks = tasks.reduce(
    (a, t) => a + t.steps.reduce((b, s) => b + s.steplist.length, 0),
    0,
  );

  const totalSteps = tasks.reduce(
    (a, t) => a + t.steps.reduce((b, s) => b + s.steplist.length, 0),
    0,
  );

  const completedSteps = tasks.reduce(
    (a, t) =>
      a +
      t.steps.reduce(
        (b, s) => b + s.steplist.filter((i) => i.status === "completed").length,
        0,
      ),
    0,
  );

  const inProgressSteps = tasks.reduce(
    (a, t) =>
      a +
      t.steps.reduce(
        (b, s) =>
          b + s.steplist.filter((i) => i.status === "in-progress").length,
        0,
      ),
    0,
  );

  const completedTasks = tasks.filter((t) =>
    t.steps.every((s) => s.steplist.every((i) => i.status === "completed")),
  ).length;

  const overallPercent =
    totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
  const stats = [
    {
      label: "Total Equipment",
      value: totalTasks,
      icon: Wrench,
      color: "text-primary",
    },
    {
      label: "Completed",
      value: completedTasks,
      icon: CheckCircle2,
      color: "text-success",
    },
    {
      label: "Steps In Progress",
      value: inProgressSteps,
      icon: Clock,
      color: "text-accent",
    },
    {
      label: "Overall Progress",
      value: `${overallPercent}%`,
      icon: ChartNoAxesCombined,
      color: "text-foreground",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-card rounded-xl border p-4 flex items-center gap-4"
        >
          <div
            className={`w-10 h-10 rounded-lg bg-secondary flex items-center justify-center ${stat.color}`}
          >
            <stat.icon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-display font-bold text-card-foreground">
              {stat.value}
            </p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
