"use client";

import { RuntimeErrorScreen, type RuntimeErrorProps } from "@/components/runtime-error-screen";

export default function PageError(props: RuntimeErrorProps) {
  return <RuntimeErrorScreen {...props} />;
}
