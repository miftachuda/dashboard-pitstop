import { StepTask } from "@/types/maintenance";
import { pb } from "@/lib/pocketbase";
function parseDate(str: string) {
  const [d, t] = str.split(" ");
  const [day, month, year] = d.split("-").map(Number);
  const [hour, minute] = t.split(".").map(Number);
  return new Date(year, month - 1, day, hour, minute);
}

const records = await pb.collection("pitstop").getFullList({
  sort: "title",
});

export const initialTasks: StepTask[] = [
  {
    id: "task-1",
    title: "021F-101",
    equipment: "Long Residue Heater",
    priority: "high",
    type: "Furnace",
    dicipline: "Stationary",
    assignee: "Miftachul Huda",
    lastmodified: parseDate("12-12-2025 13.00").getTime(),
    steps: [
      {
        id: "task-1-step-1",
        stepname: "Preparation",
        steplist: [
          {
            id: "task-1-step-1-item-1",
            title: "Pasang blind In/Out",
            description: "-",
            startdate: parseDate("12-12-2026 13.00").getTime(),
            enddate: parseDate("12-12-2026 16.00").getTime(),
            status: "completed",
          },
        ],
      },
      {
        id: "task-1-step-2",
        stepname: "INTERNAL RADIANT",
        steplist: [
          {
            id: "task-1-step-2-item-1",
            title: "Refrigerant Check",
            description: "-",
            startdate: parseDate("12-12-2026 13.00").getTime(),
            enddate: parseDate("12-12-2026 16.00").getTime(),
            status: "not yet",
          },
          {
            id: "task-1-step-2-item-2",
            title: "System Restart",
            description: "-",
            startdate: parseDate("12-12-2026 13.00").getTime(),
            enddate: parseDate("12-12-2026 16.00").getTime(),
            status: "not yet",
          },
        ],
      },
      {
        id: "task-1-step-3",
        stepname: "Burner System",
        steplist: [
          {
            id: "task-1-step-3-item-1",
            title: "Refrigerant Check",
            description: "-",
            startdate: parseDate("12-12-2026 13.00").getTime(),
            enddate: parseDate("12-12-2026 16.00").getTime(),
            status: "not yet",
          },
          {
            id: "task-1-step-3-item-2",
            title: "System Restart",
            description: "-",
            startdate: parseDate("12-12-2026 13.00").getTime(),
            enddate: parseDate("12-12-2026 16.00").getTime(),
            status: "not yet",
          },
        ],
      },
    ],
  },

  {
    id: "task-2",
    title: "021E-101",
    equipment: "Intermediate Residue Heater",
    priority: "critical",
    type: "High Exchanger",
    dicipline: "Stationary",
    assignee: "Miftachul Huda",
    lastmodified: parseDate("12-12-2025 13.00").getTime(),
    steps: [
      {
        id: "task-2-step-1",
        stepname: "Preparation",
        steplist: [
          {
            id: "task-2-step-1-item-1",
            title: "Pasang blind In/Out",
            description: "-",
            startdate: parseDate("12-12-2026 13.00").getTime(),
            enddate: parseDate("12-12-2026 16.00").getTime(),
            status: "completed",
          },
        ],
      },
      {
        id: "task-2-step-2",
        stepname: "INTERNAL RADIANT",
        steplist: [
          {
            id: "task-2-step-2-item-1",
            title: "Refrigerant Check",
            description: "-",
            startdate: parseDate("12-12-2026 13.00").getTime(),
            enddate: parseDate("12-12-2026 16.00").getTime(),
            status: "not yet",
          },
          {
            id: "task-2-step-2-item-2",
            title: "System Restart",
            description: "Run diagnostics",
            startdate: parseDate("12-12-2026 13.00").getTime(),
            enddate: parseDate("12-12-2026 16.00").getTime(),
            status: "not yet",
          },
        ],
      },
      {
        id: "task-2-step-3",
        stepname: "Burner System",
        steplist: [
          {
            id: "task-2-step-3-item-1",
            title: "Refrigerant Check",
            description: "-",
            startdate: parseDate("12-12-2026 13.00").getTime(),
            enddate: parseDate("12-12-2026 16.00").getTime(),
            status: "not yet",
          },
          {
            id: "task-2-step-3-item-2",
            title: "System Restart",
            description: "-",
            startdate: parseDate("12-12-2026 13.00").getTime(),
            enddate: parseDate("12-12-2026 16.00").getTime(),
            status: "not yet",
          },
        ],
      },
    ],
  },
  {
    id: "task-3",
    title: "021F-102",
    equipment: "Intermediate Residue Heater",
    priority: "high",
    type: "Furnace",
    dicipline: "Stationary",
    assignee: "Miftachul Huda",
    lastmodified: parseDate("12-12-2025 13.00").getTime(),
    steps: [
      {
        id: "task-3-step-1",
        stepname: "Preparation",
        steplist: [
          {
            id: "task-3-step-1-item-1",
            title: "Pasang blind In/Out",
            description: "-",
            startdate: parseDate("12-12-2026 13.00").getTime(),
            enddate: parseDate("12-12-2026 16.00").getTime(),
            status: "completed",
          },
        ],
      },
      {
        id: "task-3-step-2",
        stepname: "INTERNAL RADIANT",
        steplist: [
          {
            id: "task-3-step-2-item-1",
            title: "Refrigerant Check",
            description: "-",
            startdate: parseDate("12-12-2026 13.00").getTime(),
            enddate: parseDate("12-12-2026 16.00").getTime(),
            status: "not yet",
          },
          {
            id: "task-3-step-2-item-2",
            title: "System Restart",
            description: "Run diagnostics",
            startdate: parseDate("12-12-2026 13.00").getTime(),
            enddate: parseDate("12-12-2026 16.00").getTime(),
            status: "not yet",
          },
        ],
      },
      {
        id: "task-3-step-3",
        stepname: "Burner System",
        steplist: [
          {
            id: "task-3-step-3-item-1",
            title: "Refrigerant Check",
            description: "-",
            startdate: parseDate("12-12-2026 13.00").getTime(),
            enddate: parseDate("12-12-2026 16.00").getTime(),
            status: "not yet",
          },
          {
            id: "task-3-step-3-item-2",
            title: "System Restart",
            description: "-",
            startdate: parseDate("12-12-2026 13.00").getTime(),
            enddate: parseDate("12-12-2026 16.00").getTime(),
            status: "not yet",
          },
        ],
      },
    ],
  },
];
