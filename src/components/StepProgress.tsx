import { StepTask, Priority } from "@/types/maintenance";
import { Check, Circle, Hourglass } from "lucide-react";
import { useEffect, useState } from "react";
import DateRange from "./DateRange";
import { formatDistanceToNow } from "date-fns";
import { ChevronDown, ChevronRight } from "lucide-react";
import ProgressSlider from "./ProgressSlider";

interface StepProgressProps {
  task: StepTask;
  onStepToggle: (taskId: string, stepId: string, itemId: string) => void;
  setTasks: React.Dispatch<React.SetStateAction<StepTask[]>>;
}

const priorityClasses: Record<Priority, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-accent/20 text-accent-foreground",
  high: "bg-warning/20 text-warning-foreground",
  critical: "bg-destructive/15 text-destructive",
};

const priorityLabels: Record<Priority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};
function getDuration(start?: number, end?: number) {
  if (!start || !end) return "-";

  const diff = new Date(end).getTime() - new Date(start).getTime();
  if (diff <= 0) return "-";

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  return `${hours}h ${mins}m`;
}

export function StepProgress({
  task,
  onStepToggle,
  setTasks,
}: StepProgressProps) {
  const [openSteps, setOpenSteps] = useState<Record<string, boolean>>({});

  const toggleStep = (stepId: string) => {
    setOpenSteps((prev) => ({
      ...prev,
      [stepId]: !prev[stepId],
    }));
  };
  useEffect(() => {
    setOpenSteps((prev) => {
      const updated = { ...prev };

      task.steps.forEach((s) => {
        if (!(s.id in updated)) {
          updated[s.id] = false; // default collapsed
        }
      });

      return updated;
    });
  }, [task.steps]);
  function formatDate(ts?: number) {
    if (!ts) return "-- ---";
    return new Date(ts).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "2-digit",
    });
  }

  function formatTime(ts?: number) {
    if (!ts) return "--:--";
    return new Date(ts).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }
  const handleTimeChange = (
    taskId: string,
    stepId: string,
    itemId: string,
    field: "startdate" | "enddate",
    value: number,
  ) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? {
              ...task,
              steps: task.steps.map((step) =>
                step.id === stepId
                  ? {
                      ...step,
                      steplist: step.steplist.map((item) =>
                        item.id === itemId ? { ...item, [field]: value } : item,
                      ),
                    }
                  : step,
              ),
            }
          : task,
      ),
    );
  };
  const totalProgress = task.steps.reduce(
    (acc, step) =>
      acc + step.steplist.reduce((sum, item) => sum + (item.progress || 0), 0),
    0,
  );

  const totalItems = task.steps.reduce(
    (acc, step) => acc + step.steplist.length,
    0,
  );

  // rata-rata progress
  const percent = totalItems > 0 ? Math.round(totalProgress / totalItems) : 0;

  const allDone = task.steps.every((s) =>
    s.steplist.every((i) => i.status === "completed"),
  );
  const onUpdateDescription = (
    taskId: string,
    stepId: string,
    itemId: string,
    value: string,
  ) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? {
              ...task,
              steps: task.steps.map((step) =>
                step.id === stepId
                  ? {
                      ...step,
                      steplist: step.steplist.map((item) =>
                        item.id === itemId
                          ? { ...item, description: value }
                          : item,
                      ),
                    }
                  : step,
              ),
            }
          : task,
      ),
    );
  };
  const handleProgressChange = (
    taskId: string,
    stepId: string,
    itemId: string,
    val: number,
  ) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? {
              ...task,
              steps: task.steps.map((step) =>
                step.id === stepId
                  ? {
                      ...step,
                      steplist: step.steplist.map((item) =>
                        item.id === itemId
                          ? {
                              ...item,
                              progress: val, // ✅ simpan progress per item
                              status:
                                val === 100
                                  ? "completed"
                                  : val > 0
                                    ? "in-progress"
                                    : "not yet",
                            }
                          : item,
                      ),
                    }
                  : step,
              ),
            }
          : task,
      ),
    );
  };
  const handleAutoResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const el = e.target;
    el.style.height = "auto"; // reset
    el.style.height = el.scrollHeight + "px"; // grow
  };
  return (
    <div className="bg-card rounded-xl border p-3 hover:shadow-lg transition-shadow duration-300">
      {/* Header */}
      <div className="flex items-start justify-between mb-1">
        <div>
          <div className="flex flex-row items-center">
            <h3 className="font-display font-semibold text-base text-card-foreground">
              {task.title}
              <span className="mx-1">•</span>
            </h3>
            <div className="text-[9px] text-muted-foreground">
              last modified:{" "}
              <span className="text-[9px] text-muted-foreground italic">
                {formatDistanceToNow(new Date(task.lastmodified), {
                  addSuffix: true,
                })}
              </span>
            </div>
          </div>
        </div>
        <span
          className={`text-xs font-semibold px-2 py-1 rounded-md uppercase tracking-wider ${priorityClasses[task.priority]}`}
        >
          {priorityLabels[task.priority]}
        </span>
      </div>
      <div className="mb-1">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            Progress
          </span>
          <span
            className={`text-xs font-mono font-semibold ${allDone ? "text-success" : "text-foreground"}`}
          >
            {percent}%
          </span>
        </div>
        <div className="h-2 rounded-full bg-secondary overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${allDone ? "bg-success" : "bg-accent"}`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
      <p className="text-sm text-muted-foreground font-mono mt-0.5">
        {task.equipment}
      </p>
      {/* Meta */}
      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
        <span>
          PIC: <strong className="text-foreground">{task.assignee}</strong>
        </span>
      </div>

      <div className="space-y-1">
        {task.steps.map((step) => (
          <div key={step.id} className=" rounded-lg p-1">
            <div key={step.id}>
              <button
                onClick={() => toggleStep(step.id)}
                className="w-full flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-1 hover:text-foreground"
              >
                <span>{step.stepname}</span>

                {openSteps[step.id] ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>

              {openSteps[step.id] && (
                <div>
                  {step.steplist.map((item) => (
                    <div
                      key={item.id}
                      className="w-full flex items-center mt-2 border gap-1 my-1 rounded-lg  transition-colors text-left group"
                    >
                      {/* Status indicator */}

                      <div className="flex flex-col w-full">
                        <p
                          className={`text-xs text-wrap font-medium truncate ${
                            item.status === "completed"
                              ? "text-card-foreground"
                              : "text-muted-foreground"
                          } px-3 py-2`}
                        >
                          {item.steptitle}
                        </p>
                        <div>
                          <div className="flex items-center w-full gap-3 p-2 rounded-md ">
                            <div
                              className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold
      ${item.status === "completed" ? "bg-success text-success-foreground" : ""}
      ${item.status === "in-progress" ? "bg-accent text-accent-foreground" : ""}
      ${item.status === "not yet" ? "bg-secondary text-muted-foreground" : ""}
    `}
                            >
                              {item.status === "completed" ? (
                                <Check className="w-3.5 h-3.5" />
                              ) : item.status === "in-progress" ? (
                                <Hourglass className="w-3.5 h-3.5" />
                              ) : (
                                <Circle className="w-3 h-3" />
                              )}
                            </div>
                            <button
                              className={`flex-shrink-0 min-w-[80px] text-center whitespace-nowrap
    text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md
    ${item.status === "completed" ? "bg-success/10 text-success" : ""}
    ${item.status === "in-progress" ? "bg-accent/15 text-accent-foreground" : ""}
    ${item.status === "not yet" ? "bg-secondary text-muted-foreground" : ""}
  `}
                            >
                              {item.status}
                            </button>

                            <div className="flex flex-col items-end gap-1">
                              <div className="flex items-center gap-2 mt-1">
                                <DateRange
                                  item={item}
                                  taskId={task.id}
                                  stepId={step.id}
                                  handleTimeChange={handleTimeChange}
                                  formatDate={formatDate}
                                  formatTime={formatTime}
                                  getDuration={getDuration}
                                />
                              </div>
                            </div>
                          </div>
                          <ProgressSlider
                            value={item.progress}
                            taskId={task.id}
                            stepId={step.id}
                            itemId={item.id}
                            onChange={handleProgressChange}
                          />
                          <div className="flex-1 min-w-0 px-3 py-2">
                            <textarea
                              rows={1}
                              spellCheck={false}
                              value={item.description || ""}
                              onChange={(e) => {
                                handleAutoResize(e);
                                onUpdateDescription(
                                  task.id,
                                  step.id,
                                  item.id,
                                  e.target.value,
                                );
                              }}
                              placeholder="Click to add description"
                              className="w-full text-xs 
             bg-muted/40 border border-border rounded-[2px]
             px-2 py-1
             outline-none
             focus:ring-1 focus:ring-accent
             resize-none overflow-hidden
             text-foreground placeholder:text-muted-foreground"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
