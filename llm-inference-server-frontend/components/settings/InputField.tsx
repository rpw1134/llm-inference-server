import { InfoTooltip } from "../ui/InfoTooltip";

type TextInputFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  tooltip?: string;
  helpText?: string;
  disabled?: boolean;
};

export function TextInputField({
  label,
  value,
  onChange,
  placeholder,
  tooltip,
  helpText,
  disabled,
}: TextInputFieldProps) {
  return (
    <label className="relative space-y-2 text-sm font-medium text-neutral-200">
      <div className="flex items-center justify-between">
        <span className="block text-neutral-300">{label}</span>
        {tooltip && <InfoTooltip content={tooltip} />}
      </div>
      <input
        className={`w-full rounded-xl border p-3 text-sm text-neutral-50 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 ${
          disabled
            ? "cursor-not-allowed border-neutral-800/60 bg-neutral-900 text-neutral-500"
            : "border-neutral-800 bg-neutral-950"
        }`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
      />
      {helpText && (
        <p className="text-xs font-normal text-neutral-500">{helpText}</p>
      )}
    </label>
  );
}

type SliderInputFieldProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  tooltip?: string;
};

export function SliderInputField({
  label,
  value,
  onChange,
  min,
  max,
  step,
  tooltip,
}: SliderInputFieldProps) {
  const handleChange = (raw: string) => {
    const parsed = Number(raw);
    if (!Number.isNaN(parsed)) {
      onChange(parsed);
    }
  };

  return (
    <label className="relative space-y-2 rounded-xl border border-neutral-800 bg-neutral-900/80 p-3">
      {tooltip && (
        <div className="absolute right-2 top-2">
          <InfoTooltip content={tooltip} />
        </div>
      )}
      <div className="flex items-center justify-between text-sm text-neutral-200">
        <span>{label}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        className="w-full accent-orange-400"
      />
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        className="w-full rounded-lg border border-neutral-800 bg-neutral-950 p-2 text-sm text-neutral-50 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
      />
    </label>
  );
}
