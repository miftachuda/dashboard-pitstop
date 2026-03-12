import { StepTask } from "@/types/maintenance";
function parseDate(str) {
  const [d, t] = str.split(" ");
  const [day, month, year] = d.split("-").map(Number);
  const [hour, minute] = t.split(".").map(Number);
  return new Date(year, month - 1, day, hour, minute);
}
export const initialTasks: StepTask[] = [
  {
    id: "1",
    title: "021F-101",
    equipment: "Long Residue Heater",
    priority: "high",
    type: "Furnace",
    dicipline: "Stationary",
    assignee: "Miftachul Huda",
    dueDate: "2026-03-15",
    steps: [
      {
        id: "1",
        stepname: "Preparation",
        steplist: [
          {
            id: "1a",
            title: "Pasang blind In/Out",
            description: "-",
            startdate: parseDate("12-12-2026 13.00").getTime(),
            enddate: parseDate("12-12-2026 16.00").getTime(),
            status: "completed",
          },
        ],
      },
      {
        id: "2",
        stepname: "INTERNAL RADIANT",
        steplist: [
          {
            id: "1d",
            title: "Refrigerant Check",
            description: "-",
            startdate: parseDate("12-12-2026 13.00").getTime(),
            enddate: parseDate("12-12-2026 16.00").getTime(),
            status: "not yet",
          },
          {
            id: "1e",
            title: "System Restart",
            description: "-",
            startdate: parseDate("12-12-2026 13.00").getTime(),
            enddate: parseDate("12-12-2026 16.00").getTime(),
            status: "not yet",
          },
        ],
      },
      {
        id: "3",
        stepname: "Burner System",
        steplist: [
          {
            id: "1d",
            title: "Refrigerant Check",
            description: "-",
            startdate: parseDate("12-12-2026 13.00").getTime(),
            enddate: parseDate("12-12-2026 16.00").getTime(),
            status: "not yet",
          },
          {
            id: "1e",
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
    id: "1",
    title: "021F-102",
    equipment: "Intermediate Residue Heater",
    priority: "high",
    type: "Furnace",
    dicipline: "Stationary",
    assignee: "Miftachul Huda",
    dueDate: "2026-03-15",
    steps: [
      {
        id: "1",
        stepname: "Preparation",
        steplist: [
          {
            id: "1a",
            title: "Pasang blind In/Out",
            description: "-",
            startdate: parseDate("12-12-2026 13.00").getTime(),
            enddate: parseDate("12-12-2026 16.00").getTime(),
            status: "completed",
          },
        ],
      },
      {
        id: "2",
        stepname: "INTERNAL RADIANT",
        steplist: [
          {
            id: "1d",
            title: "Refrigerant Check",
            description: "-",
            startdate: parseDate("12-12-2026 13.00").getTime(),
            enddate: parseDate("12-12-2026 16.00").getTime(),
            status: "not yet",
          },
          {
            id: "1e",
            title: "System Restart",
            description: "Run diagnostics",
            startdate: parseDate("12-12-2026 13.00").getTime(),
            enddate: parseDate("12-12-2026 16.00").getTime(),
            status: "not yet",
          },
        ],
      },
      {
        id: "3",
        stepname: "Burner System",
        steplist: [
          {
            id: "1f",
            title: "Refrigerant Check",
            description: "-",
            startdate: parseDate("12-12-2026 13.00").getTime(),
            enddate: parseDate("12-12-2026 16.00").getTime(),
            status: "not yet",
          },
          {
            id: "1g",
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
    id: "2",
    title: "Elevator Annual Inspection",
    equipment: "Elevator B — West Wing",
    priority: "critical",
    type: "Heat Exchanger",
    dicipline: "Stationary",
    assignee: "Sarah K.",
    dueDate: "2026-03-12",
    steps: [
      {
        id: "1",
        stepname: "Preparation",
        steplist: [
          {
            id: "2a",
            title: "System Shutdown",
            description: "-",
            startdate: parseDate("12-12-2026 13.00").getTime(),
            enddate: parseDate("12-12-2026 16.00").getTime(),
            status: "completed",
          },
          {
            id: "2b",
            title: "Safety Lock",
            description: "-",
            startdate: parseDate("12-12-2026 13.00").getTime(),
            enddate: parseDate("12-12-2026 16.00").getTime(),
            status: "in-progress",
          },
        ],
      },
    ],
  },

  {
    id: "3",
    title: "Generator Maintenance",
    equipment: "Backup Generator #1",
    priority: "medium",
    type: "Furnace",
    dicipline: "Stationary",
    assignee: "James T.",
    dueDate: "2026-03-20",
    steps: [
      {
        id: "1",
        stepname: "Inspection",
        steplist: [
          {
            id: "3a",
            title: "Oil Check",
            description: "-",
            startdate: parseDate("12-12-2026 13.00").getTime(),
            enddate: parseDate("12-12-2026 16.00").getTime(),
            status: "completed",
          },
          {
            id: "3b",
            title: "Battery Test",
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
    id: "4",
    title: "Fire Suppression Inspection",
    equipment: "Sprinkler System — Floor 2",
    priority: "high",
    type: "Furnace",
    dicipline: "Stationary",
    assignee: "Maria L.",
    dueDate: "2026-03-18",
    steps: [
      {
        id: "1",
        stepname: "System Check",
        steplist: [
          {
            id: "4a",
            title: "Pressure Test",
            description: "-",
            startdate: parseDate("12-12-2026 13.00").getTime(),
            enddate: parseDate("12-12-2026 16.00").getTime(),
            status: "completed",
          },
          {
            id: "4b",
            title: "Valve Inspection",
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
    id: "5",
    title: "Lighting Retrofit",
    equipment: "Office Floor 5 — LED Upgrade",
    priority: "low",
    type: "Furnace",
    dicipline: "Stationary",
    assignee: "Alex W.",
    dueDate: "2026-03-25",
    steps: [
      {
        id: "1",
        stepname: "Installation",
        steplist: [
          {
            id: "5a",
            title: "Remove Old Lights",
            description: "-",
            startdate: null,
            enddate: null,
            status: "completed",
          },
          {
            id: "5b",
            title: "Install LED",
            description: "-",
            startdate: null,
            enddate: null,
            status: "not yet",
          },
        ],
      },
    ],
  },
];
