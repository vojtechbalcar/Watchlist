import type { ComponentProps } from "react";
import { ChevronDown } from "lucide-react";

/** Keep the native picker and keyboard behavior, with consistently placed chrome. */
export function SelectField({ children, ...props }: ComponentProps<"select">) {
  const single = !props.multiple && (!props.size || props.size === 1);
  return <span className="select-field">
    <select {...props}>{children}</select>
    {single && <ChevronDown size={16} aria-hidden="true" />}
  </span>;
}
