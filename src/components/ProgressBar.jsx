//
// Simple animated progress bar.
// Used inside CategoryCard and the watering overlay.

function ProgressBar({ value, color, height = "h-1.5", animate = true }) {
  return (
    <div className={`${height} bg-green-100 rounded-full overflow-hidden`}>
      <div
        className={`h-full rounded-full ${animate ? "transition-all duration-1000" : ""}`}
        style={{ width: `${value}%`, background: color }}
      />
    </div>
  );
}

export default ProgressBar;
