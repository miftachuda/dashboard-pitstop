import { useState } from "react";

type Props = {
  title: string;
  children: React.ReactNode;
};

export function Collapsible({ title, children }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border rounded-md mt-2">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-2 flex justify-between items-center bg-gray-50 text-[12px] font-medium rounded-md"
      >
        <span>{title}</span>
        <span
          className={`transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        >
          ▼
        </span>
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ${
          open ? "max-h-96 p-4" : "max-h-0"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
