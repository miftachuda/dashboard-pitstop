import { useRef } from "react";

export default function ProgressSlider({ value, onChange }) {
  const barRef = useRef(null);

  const updateValue = (clientX) => {
    const rect = barRef.current.getBoundingClientRect();
    const percent = ((clientX - rect.left) / rect.width) * 100;
    const clamped = Math.max(0, Math.min(100, percent));
    onChange(Math.round(clamped));
  };

  const handleMouseDown = (e) => {
    updateValue(e.clientX);

    const move = (e) => updateValue(e.clientX);
    const up = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  return (
    <div className="flex flex-row items-center gap-2 w-full px-2">
      <div
        ref={barRef}
        onMouseDown={handleMouseDown}
        className="w-full bg-gray-200 rounded h-4 overflow-hidden cursor-pointer"
      >
        <div
          className={`h-full transition-all ${
            value === 100 ? "bg-green-500" : "bg-orange-500"
          }`}
          style={{ width: `${value}%` }}
        />
      </div>

      <span className="select-none">{String(value).padStart(2, "0")}%</span>
    </div>
  );
}
