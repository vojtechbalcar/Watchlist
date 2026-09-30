"use client";

import { createContext, useContext } from "react";

export type Account = { email: string; name: string | null };

const AccountContext = createContext<Account | null>(null);

export function AccountProvider({ account, children }: { account: Account; children: React.ReactNode }) {
  return <AccountContext.Provider value={account}>{children}</AccountContext.Provider>;
}

/** The signed-in account. Market pages sit behind the session check in their layout. */
export function useAccount() {
  const account = useContext(AccountContext);
  if (!account) throw new Error("useAccount must be used inside the market layout");
  return account;
}
