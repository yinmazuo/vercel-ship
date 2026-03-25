"use client";

import {
  Show,
  SignInButton,
  SignUpButton,
  UserButton
} from "@clerk/nextjs";

export function AuthPanel({ enabled }: { enabled: boolean }) {
  if (!enabled) {
    return (
      <div className="auth-block">
        <p className="eyebrow">Authentication</p>
        <h2>Clerk wiring activates automatically after provisioning.</h2>
        <p>
          This starter is already prepared for Clerk. Once the environment variables exist, users can sign
          in without changing the UI shell.
        </p>
      </div>
    );
  }

  return (
    <div className="auth-block">
      <Show when="signed-out">
        <p className="eyebrow">Authentication</p>
        <h2>Sign in to turn the dashboard shell into a live workspace.</h2>
        <div className="auth-actions">
          <SignInButton mode="modal">
            <button className="cta primary" type="button">
              Sign in
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className="cta secondary" type="button">
              Create account
            </button>
          </SignUpButton>
        </div>
      </Show>
      <Show when="signed-in">
        <div className="auth-header">
          <div>
            <p className="eyebrow">Authentication</p>
            <h2>Signed in. The workspace shell is now backed by Clerk.</h2>
          </div>
          <UserButton />
        </div>
        <p>
          Use this screen as the base for protected pages, account management, and tenant-aware dashboards
          once the plan is approved.
        </p>
      </Show>
    </div>
  );
}
