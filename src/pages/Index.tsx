import { useState } from "react";
import { initialTasks } from "@/data/mydata";
import { StepStatus, StepTask } from "@/types/maintenance";
import { StepProgress } from "@/components/StepProgress";
import { StatsBar } from "@/components/StatsBar";
import { Wrench } from "lucide-react";

const Index = () => {
  const [tasks, setTasks] = useState<StepTask[]>(initialTasks);

  const cycleStatus = (current: StepStatus): StepStatus => {
    if (current === "not yet") return "in-progress";
    if (current === "in-progress") return "completed";
    return "not yet";
  };

  const handleStepToggle = (taskId: string, stepId: string, itemId: string) => {
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
                          ? { ...item, status: cycleStatus(item.status) }
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <Wrench className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-display font-bold text-foreground leading-tight">
              Dashboard Pit Stop LOC II 2026
            </h1>
            <p className="text-xs text-muted-foreground font-mono">
              Restoring Performance Strengthening Reliability
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StatsBar tasks={tasks} />

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {tasks.map((task) => (
            <StepProgress
              key={task.id}
              task={task}
              onStepToggle={handleStepToggle}
              setTasks={setTasks}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Index;
