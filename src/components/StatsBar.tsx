import { StepTask } from "@/types/maintenance";
import {
  Wrench,
  CheckCircle2,
  Clock,
  ChartNoAxesCombined,
  NotepadText,
} from "lucide-react";

interface StatsBarProps {
  tasks: StepTask[];
}

export function StatsBar({ tasks }: StatsBarProps) {
  const totalEquipments = tasks.length;

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
  const notyetSteps = tasks.reduce(
    (a, t) =>
      a +
      t.steps.reduce(
        (b, s) => b + s.steplist.filter((i) => i.status === "not yet").length,
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

  const completedEquipments = tasks.filter((t) =>
    t.steps.every((s) => s.steplist.every((i) => i.status === "completed")),
  ).length;

  const overallPercent =
    totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
  const stats = [
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
      <div
        key={"Total Equipments"}
        className="bg-card rounded-xl border p-4 flex items-center gap-4"
      >
        <div
          className={`w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-foreground`}
        >
          <Wrench className="w-5 h-5" />
        </div>
        <div>
          <div className="flex flex-row items-center gap-1">
            <p className="text-2xl font-display font-bold text-card-foreground">
              {completedEquipments}
            </p>
            <p className="text-xs text-foreground">Equipment Completed</p>
          </div>
          <p className="text-xs text-muted-foreground">
            From {totalEquipments} Equipments
          </p>
        </div>
      </div>
      <div
        key={"Total Steps"}
        className="bg-card rounded-xl border p-4 flex items-center gap-4"
      >
        <div
          className={`w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-success`}
        >
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div>
          <div className="flex flex-row items-center gap-1">
            <p className="text-2xl font-display font-bold text-card-foreground">
              {completedSteps}
            </p>
            <p className="text-xs text-foreground">Steps Completed</p>
          </div>
          <p className="text-xs text-muted-foreground">
            From {totalSteps} Steps
          </p>
        </div>
      </div>
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
