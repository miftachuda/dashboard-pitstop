import ExportTable from "@/components/ExportTable";
import DashboardLayout from "@/components/MainLayout";
import ReportTable from "@/components/ReportTable";
import { pb } from "@/lib/pocketbase";
import { StepGroup, StepTask } from "@/types/maintenance";
import { useEffect, useState } from "react";

const ExportPage = () => {
  const [tasks, setTasks] = useState<StepTask[]>([]);
  const [loading, setLoading] = useState(true);
  function recordToStepTask(r: any): StepTask {
    let steps: StepGroup[] = [];

    try {
      steps = typeof r.steps === "string" ? JSON.parse(r.steps) : r.steps;
    } catch {
      steps = [];
    }

    const photos = !r.photos
      ? []
      : Array.isArray(r.photos)
        ? r.photos
        : [r.photos]; // <-- fix here

    return {
      id: r.id,
      title: r.title ?? "",
      equipment: r.equipment ?? "",
      type: r.type ?? "",
      dicipline: r.dicipline ?? "",
      priority: r.priority ?? "low",
      assignee: r.assignee ?? "",
      lastmodified: r.updatedCustom ?? Date.now(),
      steps,
      photos,
    };
  }
  async function loadTasks() {
    try {
      const pitstopRecords = await pb.collection("additionals").getFullList({
        sort: "-updatedCustom",
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
  return (
    <DashboardLayout>
      <div>
        <ReportTable items={tasks} />
        <ExportTable items={tasks} />
      </div>
    </DashboardLayout>
  );
};

export default ExportPage;
