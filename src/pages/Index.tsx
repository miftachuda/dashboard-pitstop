import { useEffect, useState } from "react";

import {
  equipmentTypes,
  StepGroup,
  StepStatus,
  StepTask,
} from "@/types/maintenance";
import { StepProgress } from "@/components/StepProgress";
import { StatsBar } from "@/components/StatsBar";
import { pb } from "@/lib/pocketbase";
import { Toaster } from "react-hot-toast";
import { toast } from "sonner";
import { StatsBar2 } from "@/components/StatsBar2";
import Highlight from "@/components/Highlight";
import { HighlightItem } from "@/components/Highlight";
import { set } from "date-fns";

const Index = () => {
  const [tasks, setTasks] = useState<StepTask[]>([]);
  const [search, setSearch] = useState("");
  const [prefixFilter, setPrefixFilter] = useState<string | null>(null);
  const [selectedType, setselectedType] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
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
          step.steplist?.some((item) =>
            item.steptitle?.toLowerCase().includes(q),
          ),
      ) ||
      task.equipment?.toLowerCase().includes(q);

    const matchPrefix =
      !prefixFilter ||
      task.title?.substring(0, 3).toUpperCase() === prefixFilter.toUpperCase();

    const matchType =
      !selectedType || // kalau belum pilih → semua lolos
      task.type === selectedType;

    return matchSearch && matchPrefix && matchType;
  });
  const prefixes = ["021", "022", "023", "024", "025", "041"];
  const handleStepToggle = async (
    taskId: string,
    stepId: string,
    itemId: string,
  ) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const updatedSteps = task.steps.map((step) =>
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
    );

    // Update UI
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, steps: updatedSteps } : t)),
    );

    // Sync to PocketBase
    try {
      await pb.collection("pitstop").update(taskId, {
        steps: updatedSteps,
      });
    } catch (err) {
      console.error("Failed to sync with PocketBase", err);
    }
  };
  const syncTaskToPocketBase = async (task) => {
    try {
      await pb.collection("pitstop").update(task.id, {
        steps: task.steps,
      });
    } catch (err) {
      console.error("Failed to sync with PocketBase", err);
    }
  };

  const [taskStates, setTaskStates] = useState<{
    [taskId: string]: {
      isDirty: boolean;
      isSaving: boolean;
      isSaved: boolean;
    };
  }>({});
  const updateTaskState = (taskId: string, newState: Partial<any>) => {
    setTaskStates((prev) => ({
      ...prev,
      [taskId]: {
        ...prev[taskId],
        ...newState,
      },
    }));
  };
  const handleSave = async (taskId: string) => {
    try {
      updateTaskState(taskId, { isSaving: true, isSaved: false });

      // API call here

      await syncTaskToPocketBase(tasks.find((t) => t.id === taskId)!);
      updateTaskState(taskId, {
        isSaving: false,
        isDirty: false,
        isSaved: true,
      });
      toast.success("Changes saved");
    } catch (err) {
      updateTaskState(taskId, { isSaving: false });
      toast.error("Failed to save changes");
    }
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
      lastmodified: r.updated ?? Date.now(),
      steps,
    };
  }
  async function loadTasks() {
    try {
      const pitstopRecords = await pb.collection("pitstop").getFullList({
        sort: "title",
      });
      const fetchedTasks: StepTask[] = pitstopRecords.map(recordToStepTask);
      setTasks(fetchedTasks);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    loadTasks();
  }, []);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [now, setNow] = useState<Date>(new Date());

  // function to refresh data
  const refreshData = async () => {
    try {
      console.log("refreshing data...");

      window.location.reload(); // reload page
      setLastRefresh(new Date());
    } catch (err) {
      console.error(err);
    }
  };
  // auto refresh every 3 minutes
  useEffect(() => {
    const interval = setInterval(
      () => {
        refreshData();
      },
      5 * 60 * 1000,
    ); // 3 minutes

    return () => clearInterval(interval);
  }, []);

  // update "time ago" every second
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getTimeAgo = () => {
    const diff = Math.floor((now.getTime() - lastRefresh.getTime()) / 1000);

    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Toaster />
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
          <p className="text-[10px] text-muted-foreground font-mono mt-1">
            Last refresh: {getTimeAgo()}
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-primary"></div>
          </div>
        ) : (
          <div className="flex flex-col gap-0">
            <StatsBar tasks={tasks} />
            <StatsBar2 tasks={tasks} />
            <Highlight />
          </div>
        )}

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
        <div className="flex flex-wrap gap-2 mt-3 mb-6">
          <button
            onClick={() => setselectedType(null)}
            className={`px-3 py-1 rounded-md border text-sm ${
              selectedType === null ? "bg-primary text-white" : "bg-white"
            }`}
          >
            All
          </button>

          {equipmentTypes.map((p) => (
            <button
              key={p}
              onClick={() => setselectedType(p)}
              className={`px-3 py-1 rounded-md border text-sm ${
                selectedType === p ? "bg-primary text-white" : "bg-white"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-primary"></div>
          </div>
        ) : (
          <div>
            <div>
              {filteredTasks.length} Equipment{""}
              {filteredTasks.length !== 1 && "s"} found
            </div>
            <div className="grid items-start grid-cols-1 md:grid-cols-1 xl:grid-cols-2 gap-5">
              {filteredTasks.map((task) => (
                <StepProgress
                  key={task.id}
                  task={task}
                  onStepToggle={handleStepToggle}
                  setTasks={setTasks}
                  state={taskStates[task.id] || {}}
                  updateTaskState={updateTaskState}
                  onSave={handleSave}
                />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
