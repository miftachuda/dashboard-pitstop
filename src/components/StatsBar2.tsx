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
  return (
    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
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
            <div className="flex flex-col items-center justify-start">
              <p className="text-xs font-display font-bold text-card-foreground">
                {eTypes}
              </p>

              <div className="flex items-center gap-2 mt-2">
                {/* Circular */}
                <div className="relative w-36 aspect-square">
                  <CircularProgressbar
                    value={progress.average}
                    text="" // ❌ remove default text
                    circleRatio={0.75}
                    strokeWidth={18}
                    styles={buildStyles({
                      rotation: 1 / 2 + 1 / 8,
                      strokeLinecap: "butt",
                      trailColor: "#eeeeee",
                      pathColor: typeColors[eTypes],
                    })}
                  />

                  {/* ✅ Custom Text Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[18px] font-bold text-gray-900">
                      {progress.average.toFixed(2)}%
                    </span>
                  </div>
                </div>
                {/* PNG Icon */}
                <div className="flex flex-col align-middle items-center">
                  <div className="mt-1 font-semibold">
                    {`${stats.completed}/${stats.total}`}
                  </div>
                  <img
                    src={`/${eTypes}.png`} // adjust path
                    alt={eTypes}
                    className="ml-2 w-14 h-14 object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
