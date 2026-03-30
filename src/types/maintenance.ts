export type StepStatus = "not yet" | "in-progress" | "completed";
export type Priority = "low" | "medium" | "high" | "critical";
export type EquipmentType =
  | "Heat Exchanger"
  | "Piping"
  | "Furnace"
  | "Column"
  | "Vessel"
  | "Pump"
  | "Compressor"
  | "Jet Ejector"
  | "Strainer"
  | "Other";
export const equipmentTypes: EquipmentType[] = [
  "Heat Exchanger",
  "Piping",
  "Furnace",
  "Column",
  "Vessel",
  "Pump",
  "Compressor",
  "Jet Ejector",
  "Strainer",
  "Other",
];
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
  type: EquipmentType;
  dicipline: string;
  priority: "low" | "medium" | "high" | "critical";
  assignee: string;
  lastmodified: number;
  steps: StepGroup[];
}
