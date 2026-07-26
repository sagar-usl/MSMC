"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/actions/auth.actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const initialState: LoginState = {};

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, initialState);

  return (
    <>
      <h1 className="mb-2 text-3xl font-bold">Welcome Back</h1>

      <p className="mb-8 text-slate-500">Sign in to continue to MSMC Admin.</p>

      <form action={formAction} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium text-slate-700">
            Email
          </label>
          <Input id="email" name="email" type="email" placeholder="you@msmc.gov.in" required autoComplete="email" />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="password" className="text-sm font-medium text-slate-700">
            Password
          </label>
          <Input id="password" name="password" type="password" placeholder="••••••••" required autoComplete="current-password" />
        </div>

        {state.error && <p className="text-sm text-red-600">{state.error}</p>}

        <Button type="submit" disabled={isPending} className="w-full justify-center py-3 text-base">
          {isPending ? "Signing in…" : "Login"}
        </Button>
      </form>
    </>
  );
}
