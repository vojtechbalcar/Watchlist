import { extname } from "node:path";

// Match the bundler's extensionless local imports when Node strips TS types.
export function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith(".") && !extname(specifier) && context.parentURL?.includes("/src/lib/")) {
    return nextResolve(`${specifier}.ts`, context);
  }
  return nextResolve(specifier, context);
}
