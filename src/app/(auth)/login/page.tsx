import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = { title: "Log in | Watchlist" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { callbackUrl } = await searchParams;
  return <AuthForm mode="login" callbackUrl={typeof callbackUrl === "string" ? callbackUrl : undefined} />;
}
