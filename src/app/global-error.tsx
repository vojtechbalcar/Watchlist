"use client";

import { RuntimeErrorScreen, type RuntimeErrorProps } from "@/components/runtime-error-screen";
import { helveticaNeue } from "./fonts";

export default function GlobalError(props: RuntimeErrorProps) {
  return (
    <html lang="en" className={helveticaNeue.variable}>
      <body style={{ margin: 0 }}>
        <RuntimeErrorScreen {...props} global />
      </body>
    </html>
  );
}
