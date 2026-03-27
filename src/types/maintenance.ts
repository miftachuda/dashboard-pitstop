export type StepStatus = "not yet" | "in-progress" | "completed";
export type Priority = "low" | "medium" | "high" | "critical";

export interface MaintenanceStep {
  id: string;
  steptitle: string;
  description: string;
  progress: number;
  startdate?: number;
  enddate?: number;
  status: StepStatus;
}

export interface StepGroup {
  id: string;
  stepname: string;
  steplist: MaintenanceStep[];
}

export interface StepTask {
  id: string;
  title: string;
  equipment: string;
  type: string;
  dicipline: string;
  priority: "low" | "medium" | "high" | "critical";
  assignee: string;
  lastmodified: number;
  steps: StepGroup[];
}
