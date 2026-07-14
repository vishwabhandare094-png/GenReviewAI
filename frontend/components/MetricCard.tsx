interface MetricCardProps {
  label: string;
  value: string | number;
  tone?: "default" | "sage" | "plum" | "amber";
  suffix?: string;
}

const TONE_MAP: Record<string, string> = {
  default: "text-ink",
  sage: "text-sage-dark",
  plum: "text-plum-dark",
  amber: "text-amber-dark",
};

export default function MetricCard({
  label,
  value,
  tone = "default",
  suffix,
}: MetricCardProps) {
  return (
    <div className="border border-line bg-paper px-5 py-5">
      <p className="font-mono text-[11px] uppercase tracking-wider text-ink-faint">
        {label}
      </p>
      <p className={`mt-2 font-mono text-3xl font-semibold tabular ${TONE_MAP[tone]}`}>
        {value}
        {suffix && <span className="ml-1 text-base font-normal text-ink-faint">{suffix}</span>}
      </p>
    </div>
  );
}
