import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return (
      <main className="auth-screen">
        <div className="auth-card">
          <p className="eyebrow">Clerk not configured</p>
          <h1>Provision Clerk to enable sign-up.</h1>
        </div>
      </main>
    );
  }

  return (
    <main className="auth-screen">
      <div className="auth-card">
        <SignUp />
      </div>
    </main>
  );
}
