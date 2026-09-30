import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = { title: "Create an account | Watchlist" };

export default async function RegisterPage({ searchParams }: PageProps<"/register">) {
  const { callbackUrl } = await searchParams;
  return <AuthForm mode="register" callbackUrl={typeof callbackUrl === "string" ? callbackUrl : undefined} />;
}
