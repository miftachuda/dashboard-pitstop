import { useEffect, useState } from "react";
import { initialTasks } from "@/data/mydata";
import { StepGroup, StepStatus, StepTask } from "@/types/maintenance";
import { StepProgress } from "@/components/StepProgress";
import { StatsBar } from "@/components/StatsBar";
import { pb } from "@/lib/pocketbase";

const Index = () => {
  const [tasks, setTasks] = useState<StepTask[]>(initialTasks);
  const [search, setSearch] = useState("");
  const [prefixFilter, setPrefixFilter] = useState<string | null>(null);
  const cycleStatus = (current: StepStatus): StepStatus => {
    if (current === "not yet") return "in-progress";
    if (current === "in-progress") return "completed";
    return "not yet";
  };

  const filteredTasks = tasks.filter((task) => {
    const q = search.toLowerCase();

    const matchSearch =
      !q ||
      task.title?.toLowerCase().includes(q) ||
      task.steps?.some(
        (step) =>
          step.stepname?.toLowerCase().includes(q) ||
          step.steplist?.some((item) => item.title?.toLowerCase().includes(q)),
      ) ||
      task.equipment?.toLowerCase().includes(q);

    const matchPrefix =
      !prefixFilter ||
      task.title?.substring(0, 3).toUpperCase() === prefixFilter.toUpperCase();

    return matchSearch && matchPrefix;
  });
  const prefixes = ["021", "022", "023", "024", "025", "041"];
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
  function recordToStepTask(r: any): StepTask {
    let steps: StepGroup[] = [];

    try {
      steps = typeof r.steps === "string" ? JSON.parse(r.steps) : r.steps;
    } catch {
      steps = [];
    }

    return {
      id: r.id,
      title: r.title ?? "",
      equipment: r.equipment ?? "",
      type: r.type ?? "",
      dicipline: r.dicipline ?? "",
      priority: r.priority ?? "low",
      assignee: r.assignee ?? "",
      lastmodified: r.lastmodified ?? Date.now(),
      steps,
    };
  }
  useEffect(() => {
    async function load() {
      const records = await pb
        .collection("pitstop")
        .getFullList({ sort: "title" });

      const initialTasks: StepTask[] = records.map(recordToStepTask);
      setTasks(initialTasks);
    }

    load();
  }, []);
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <img src="/logo.png" className="w-7 h-7" alt="Wrench" />
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

        <div className="mt-4 mb-6">
          <input
            type="text"
            placeholder="Search equipments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-96 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex flex-wrap gap-2 mt-3 mb-6">
          <button
            onClick={() => setPrefixFilter(null)}
            className={`px-3 py-1 rounded-md border text-sm ${
              prefixFilter === null ? "bg-primary text-white" : "bg-white"
            }`}
          >
            All
          </button>

          {prefixes.map((p) => (
            <button
              key={p}
              onClick={() => setPrefixFilter(p)}
              className={`px-3 py-1 rounded-md border text-sm ${
                prefixFilter === p ? "bg-primary text-white" : "bg-white"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredTasks.map((task) => (
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
