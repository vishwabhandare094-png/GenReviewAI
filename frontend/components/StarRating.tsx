"use client";

import { useState } from "react";

interface StarRatingProps {
  value: number;
  onChange: (rating: number) => void;
  size?: "lg" | "md";
  disabled?: boolean;
}

const LABELS: Record<number, string> = {
  1: "Rough visit",
  2: "Not great",
  3: "It was okay",
  4: "Really good",
  5: "Loved it",
};

export default function StarRating({
  value,
  onChange,
  size = "lg",
  disabled,
}: StarRatingProps) {
  const [hover, setHover] = useState(0);
  const active = hover || value;
  const dim = size === "lg" ? "w-14 h-14 sm:w-16 sm:h-16" : "w-9 h-9";

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex gap-1.5 sm:gap-2" role="radiogroup" aria-label="Rate your visit">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${star} star${star > 1 ? "s" : ""}`}
            disabled={disabled}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange(star)}
            className={`${dim} transition-transform duration-150 active:scale-90 disabled:opacity-50`}
          >
            <svg
              viewBox="0 0 24 24"
              className={`w-full h-full transition-colors duration-150 ${
                star <= active ? "fill-amber stroke-amber-dark" : "fill-transparent stroke-ink-faint"
              }`}
              strokeWidth={1.4}
            >
              <path d="M12 2.5l2.9 6.32 6.85.72-5.12 4.7 1.42 6.86L12 17.9l-6.05 3.2 1.42-6.86-5.12-4.7 6.85-.72L12 2.5z" />
            </svg>
          </button>
        ))}
      </div>
      <p className="h-5 font-mono text-xs tracking-wide text-ink-soft uppercase">
        {active ? LABELS[active] : "Tap a star"}
      </p>
    </div>
  );
}
