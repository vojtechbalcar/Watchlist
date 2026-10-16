import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/password-reset-forms";

export const metadata: Metadata = { title: "Reset your password | Watchlist" };

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
