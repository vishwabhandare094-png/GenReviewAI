import { HTMLAttributes } from "react";

interface TicketCardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

/**
 * The signature surface of the product: a printed ticket.
 * Torn edges top and bottom, warm paper fill, soft drop shadow.
 */
export default function TicketCard({
  children,
  className = "",
  ...props
}: TicketCardProps) {
  return (
    <div className="relative">
      <div className="torn-bottom h-3 bg-paper-dim -mb-px" aria-hidden />
      <div
        className={`bg-paper shadow-ticket px-6 py-8 sm:px-10 sm:py-10 ${className}`}
        {...props}
      >
        {children}
      </div>
      <div className="torn-top h-3 bg-paper-dim -mt-px" aria-hidden />
    </div>
  );
}
