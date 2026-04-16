import { StepTask, typeClasses } from "@/types/maintenance";
import { typeLabels } from "./StepProgress";

type Props = {
  open: boolean;
  onClose: () => void;
  completedSteps: number;
  totalSteps: number;
  tasks: StepTask[];
};

export default function StepsModal({
  open,
  onClose,
  completedSteps,
  totalSteps,
  tasks,
}: Props) {
  if (!open) return null;
  const completedStepsList = tasks.flatMap((task) =>
    (task.steps || []).flatMap((group) =>
      (group.steplist || [])
        .filter((step) => step.progress === 100)
        .map((step) => ({
          ...step,
          taskTitle: task.title,
          groupName: group.stepname,
        })),
    ),
  );
  const filteredTasks = tasks.filter((task) =>
    (task.steps || []).some((group) =>
      (group.steplist || []).some((step) => step.progress === 100),
    ),
  ); // hanya task yg punya group valid
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* modal content */}
      <div className="relative bg-white rounded-xl p-6 min-w-fit shadow-lg max-h-[80vh] overflow-y-auto">
        <div className="mb-4">
          <h3 className="text-sm font-semibold mb-2">
            Completed Steps ({completedStepsList.length})
          </h3>

          {completedStepsList.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              No completed steps yet
            </p>
          ) : (
            <ul className="space-y-2 ">
              {filteredTasks.map((step) => {
                const allSteps =
                  step.steps?.flatMap((g) => g.steplist || []) || [];

                const isCompleted =
                  allSteps.length > 0 &&
                  allSteps.every((s) => s.progress === 100);

                return (
                  <li
                    key={step.id}
                    className="text-sm border rounded-lg px-3 py-2"
                  >
                    <div className="flex flex-row gap-3">
                      <span
                        className={`text-xs select-none font-semibold px-2 py-1 rounded-md uppercase tracking-wider ${typeClasses[step.type]}`}
                      >
                        {typeLabels[step.type]}
                      </span>
                      <div className="font-medium">{step.title}</div>
                      <span
                        className={`px-2 py-1 rounded-md font-semibold text-[10px] uppercase tracking-wider ${
                          isCompleted
                            ? "bg-green-100 text-green-700"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {isCompleted ? "Completed" : "In Progress"}
                      </span>
                    </div>

                    {/* 🔥 UPDATED PART */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{step.equipment}</span>
                    </div>

                    {step.steps.map((group) => {
                      const isGroupCompleted = group.steplist?.length > 0;

                      return (
                        isGroupCompleted && (
                          <div key={group.id}>
                            {group.steplist
                              .filter((step) => step.progress === 100)
                              .map((step) => (
                                <li
                                  key={step.id}
                                  className="text-sm border rounded-lg px-3 py-2 mb-3"
                                >
                                  <div className="flex flex-row gap-2">
                                    <div className="text-xs text-muted-foreground">
                                      {step.progress === 100
                                        ? "✅"
                                        : step.progress}
                                    </div>
                                    <div className="font-medium">
                                      {step.steptitle}
                                    </div>
                                  </div>
                                </li>
                              ))}
                          </div>
                        )
                      );
                    })}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
