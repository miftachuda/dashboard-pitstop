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
export const typeClasses: Record<EquipmentType, string> = {
  "Heat Exchanger": "bg-blue-100 text-blue-800",
  Piping: "bg-green-100 text-green-800",
  Furnace: "bg-orange-100 text-orange-800",
  Column: "bg-yellow-100 text-yellow-800",
  Vessel: "bg-purple-100 text-purple-800",
  Pump: "bg-red-100 text-red-800",
  Compressor: "bg-indigo-100 text-indigo-800",
  "Jet Ejector": "bg-teal-100 text-teal-800",
  Strainer: "bg-gray-100 text-gray-800",
  Other: "bg-secondary text-secondary-foreground",
};

export const typeColors: Record<EquipmentType, string> = {
  "Heat Exchanger": "#3b82f6",
  Piping: "#10b981",
  Furnace: "#ef4444",
  Column: "#f59e0b",
  Vessel: "#8b5cf6",
  Pump: "#06b6d4",
  Compressor: "#ec4899",
  "Jet Ejector": "#84cc16",
  Strainer: "#f97316",
  Other: "#6b7280",
};
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
  photos?: string[]; // tambahkan field untuk menyimpan nama file gambar
}
