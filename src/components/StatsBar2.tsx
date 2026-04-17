import { typeColors, EquipmentType, StepTask } from "@/types/maintenance";

import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
interface StatsBar2Props {
  tasks: StepTask[];
}
function hexToRgb(hex: string) {
  const clean = hex.replace("#", "");
  const bigint = parseInt(clean, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  return `${r}, ${g}, ${b}`;
}

export const equipmentTypes: EquipmentType[] = [
  "Heat Exchanger",
  "Piping",
  "Furnace",
  "Vessel",
  "Jet Ejector",
  "Strainer",
  "Electrical",
  "Instrument",
];

export function StatsBar2({ tasks }: StatsBar2Props) {
  const filterTasksByType = (
    tasks: StepTask[],
    type: EquipmentType,
  ): StepTask[] => {
    return tasks.filter((task) => task.type === type);
  };
  const calculateTaskProgress = (tasks: StepTask[]) => {
    let totalProgress = 0;
    let totalSteps = 0;

    tasks.forEach((task) => {
      task.steps?.forEach((group) => {
        group.steplist?.forEach((step) => {
          totalProgress += step.progress || 0;
          totalSteps += 1;
        });
      });
    });

    return {
      totalProgress,
      totalSteps,
      average: totalSteps > 0 ? totalProgress / totalSteps : 0,
    };
  };
  const getProgressByType = (tasks: StepTask[], type: EquipmentType) => {
    const filtered = filterTasksByType(tasks, type);
    return calculateTaskProgress(filtered);
  };
  const isTaskComplete = (task: StepTask) => {
    return task.steps?.every((group) =>
      group.steplist?.every((step) => step.progress === 100),
    );
  };
  const getEquipmentTypeStats = (tasks: StepTask[], type: EquipmentType) => {
    const filtered = filterTasksByType(tasks, type);

    let total = filtered.length;
    let completed = 0;

    filtered.forEach((task) => {
      if (isTaskComplete(task)) {
        completed += 1;
      }
    });

    return {
      total,
      completed,
      percentage: total > 0 ? (completed / total) * 100 : 0,
    };
  };
  function ETypeCard({ eTypes, color = "#6C63FF" }) {
    return (
      <div
        className="relative inline-flex items-center gap-1 rounded-md px-3 py-0  overflow-hidden"
        style={{
          backgroundColor: color + "18",
          border: `1.5px solid ${color}`,
        }}
      >
        {/* Decorative glow blob */}
        <span
          className="absolute -top-3 -left-3 w-8 h-8 rounded-full blur-xl opacity-60 pointer-events-none"
          style={{ backgroundColor: color }}
        />

        <p
          className="font-display font-bold tracking-wide relative z-10"
          style={{
            color: color,
            fontSize: "clamp(12px, 2.5vw, 20px)",
          }}
        >
          {eTypes}
        </p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {equipmentTypes.map((eTypes) => {
        const progress = getProgressByType(tasks, eTypes);
        const stats = getEquipmentTypeStats(tasks, eTypes);

        return (
          <div
            key={eTypes}
            style={{
              border: `1.5px solid rgba(${hexToRgb(typeColors[eTypes])}, 0.4)`,
              boxShadow: `
      inset 0 0 10px rgba(${hexToRgb(typeColors[eTypes])}, 0.3),
      inset 0 0 20px rgba(${hexToRgb(typeColors[eTypes])}, 0.2),
      inset 0 0 40px rgba(${hexToRgb(typeColors[eTypes])}, 0.1)
    `,
              background: `rgba(255,255,255,0.85)`,
            }}
            className="rounded-xl p-2 flex items-center gap-4"
          >
            <div className="flex flex-col items-start justify-start">
              {ETypeCard({ eTypes, color: typeColors[eTypes] })}

              <div className="flex items-center gap-2 mt-2">
                {/* Circular */}
                <div className="relative w-36 aspect-square">
                  <CircularProgressbar
                    value={progress.average}
                    text=""
                    circleRatio={0.75}
                    strokeWidth={18}
                    styles={buildStyles({
                      rotation: 1 / 2 + 1 / 8,
                      strokeLinecap: "butt",
                      trailColor: "#eeeeee",
                      pathColor: typeColors[eTypes],
                    })}
                  />

                  <div className="absolute mt-8 inset-4 flex flex-col items-center justify-center">
                    <div className="flex flex-col items-center leading-none gap-1">
                      <span className="text-[20px] font-bold text-gray-900">
                        {progress.average.toFixed(2)}
                      </span>
                      <span className="text-[14px] font-bold text-gray-900 -mt-1">
                        %
                      </span>
                    </div>
                    <div className="text-[18px] font-medium mr-2">
                      <span style={{ color: typeColors[eTypes] }}>
                        {stats.completed}
                      </span>
                      /{stats.total}
                    </div>
                  </div>
                </div>

                <img
                  src={`/${eTypes}.png`}
                  alt={eTypes}
                  className="w-[clamp(24px,8vw,84px)] h-auto object-contain"
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
