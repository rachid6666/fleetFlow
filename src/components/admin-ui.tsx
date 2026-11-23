import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  account,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
  account?: ReactNode;
}) {
  return (
    <header className="page-header">
      <div className="page-header-copy">
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p className="subtitle">{description}</p>
      </div>
      {actions || account ? (
        <div className="page-header-side">
          {account ? <div className="workspace-avatar">{account}</div> : null}
          {actions}
        </div>
      ) : null}
    </header>
  );
}

export function MetricCard({
  label,
  value,
  note,
  tone = "light",
  icon,
}: {
  label: string;
  value: ReactNode;
  note: ReactNode;
  tone?: "light" | "forest" | "emerald";
  icon?: ReactNode;
}) {
  return (
    <div className={`metric-card is-${tone}`}>
      <div className="metric-card-top">
        <span className="metric-label">{label}</span>
        {icon ? <span className="metric-icon" aria-hidden="true">{icon}</span> : null}
      </div>
      <div className="metric-value">{value}</div>
      <div className="metric-note">{note}</div>
    </div>
  );
}

export function PanelHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="panel-heading">
      <div>
        {eyebrow ? <div className="eyebrow">{eyebrow}</div> : null}
        <h2>{title}</h2>
        {description ? <p className="panel-description">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function TableFrame({
  label,
  children,
  className = "",
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`table-scroll${className ? ` ${className}` : ""}`}
      role="region"
      aria-label={label}
      tabIndex={0}
    >
      {children}
    </div>
  );
}
