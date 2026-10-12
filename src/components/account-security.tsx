"use client";

import { useSearchParams } from "next/navigation";
import { useActionState, useState } from "react";
import { changePassword, deleteAccount } from "@/app/(auth)/actions";

function PasswordField({ id, name, label, autoComplete, hint }: { id: string; name: string; label: string; autoComplete: string; hint?: string }) {
  return <div className="settings-field">
    <label htmlFor={id}>{label}</label>
    <input id={id} name={name} type="password" autoComplete={autoComplete} minLength={autoComplete === "new-password" ? 8 : undefined} aria-describedby={hint ? `${id}-hint` : undefined} required />
    {hint && <p id={`${id}-hint`}>{hint}</p>}
  </div>;
}

/** Password change and account deletion, both confirmed with the current password. */
export function AccountSecurity({ email }: { email: string }) {
  const [passwordState, passwordAction, changing] = useActionState(changePassword, undefined);
  const [deleteState, deleteAction, deleting] = useActionState(deleteAccount, undefined);
  const [confirmDelete, setConfirmDelete] = useState(false);
  // changePassword redirects here on success; see its comment.
  const changed = useSearchParams().get("password") === "changed";
  const passwordMessage = passwordState?.error ?? passwordState?.success ?? (changed ? "Password changed. Other devices have been signed out." : "");

  return <>
    <form className="settings-security-form" action={passwordAction} aria-labelledby="change-password-label">
      <span className="setting-label" id="change-password-label">Change password</span>
      <p className="settings-security-hint">Signs out every other device. This one stays signed in.</p>
      {/* Lets password managers file the new password under the right account. */}
      <input type="email" name="username" autoComplete="username" value={email} readOnly hidden />
      <PasswordField id="current-password" name="currentPassword" label="Current password" autoComplete="current-password" />
      <PasswordField id="new-password" name="newPassword" label="New password" autoComplete="new-password" hint="Use at least 8 characters." />
      <div><button type="submit" className="settings-button settings-button-ink" disabled={changing}>{changing ? "Changing password…" : "Change password"}</button></div>
      <p className="settings-security-status" role="status" aria-live="polite">{passwordMessage}</p>
    </form>

    <div className="setting-row">
      <div className="setting-copy"><span className="setting-label" id="delete-account-label">Delete account</span><p id="delete-account-hint">Permanently removes your account, watchlist, and preferences.</p></div>
      <div className="setting-control"><button type="button" className="settings-button" aria-expanded={confirmDelete} aria-controls="delete-confirmation" onClick={() => setConfirmDelete(!confirmDelete)}>Delete account</button></div>
    </div>
    {confirmDelete && <form className="settings-reset settings-security-form" id="delete-confirmation" action={deleteAction} aria-labelledby="delete-confirmation-title">
      <div><strong id="delete-confirmation-title">Delete your account?</strong><p>This can’t be undone. Enter your password to confirm.</p></div>
      <input type="email" name="username" autoComplete="username" value={email} readOnly hidden />
      <PasswordField id="delete-password" name="password" label="Password" autoComplete="current-password" />
      <p className="settings-security-status" role="alert">{deleteState?.error}</p>
      <div><button type="button" className="settings-button" onClick={() => setConfirmDelete(false)}>Keep account</button><button type="submit" className="primary-action" disabled={deleting}>{deleting ? "Deleting…" : "Delete account"}</button></div>
    </form>}
  </>;
}
