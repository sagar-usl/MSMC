import { ReactNode } from "react";

interface InfoFieldProps {
  label: string;
  children: ReactNode;
}

export function InfoField({ label, children }: InfoFieldProps) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>

      <div className="mt-1 font-medium">{children}</div>
    </div>
  );
}
