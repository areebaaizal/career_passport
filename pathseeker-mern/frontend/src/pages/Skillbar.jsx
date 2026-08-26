// Renders one skill as a labeled progress bar, with an optional
// draggable slider to edit the level (0-100) when `editable` is true.
export default function SkillBar({ name, level, editable, onLevelChange, onRemove }) {
  return (
    <div className="li-skillbar-row">
      <div className="li-skillbar-head">
        <span className="li-skillbar-name">{name}</span>
        <span className="li-skillbar-pct">{level}%</span>
        {editable && (
          <button type="button" className="li-skillbar-remove" onClick={onRemove} aria-label={`Remove ${name}`}>
            ×
          </button>
        )}
      </div>
      <div className="li-skillbar-track">
        <div className="li-skillbar-fill" style={{ width: `${level}%` }} />
      </div>
      {editable && (
        <input
          type="range"
          min={0}
          max={100}
          value={level}
          onChange={(e) => onLevelChange(Number(e.target.value))}
          className="li-skillbar-slider"
        />
      )}
    </div>
  );
}