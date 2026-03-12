export type StepStatus = "not yet" | "in-progress" | "completed";
export type Priority = "low" | "medium" | "high" | "critical";

export interface MaintenanceStep {
  id: string;
  title: string;
  description: string;
  startdate?: number;
  enddate?: number;
  status: StepStatus;
}

export interface MaintenanceTask {
  id: string;
  title: string;
  equipment: string;
  priority: Priority;
  assignee: string;
  dueDate: string;
  steps: MaintenanceStep[];
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
  dueDate: string;
  steps: StepGroup[];
}
