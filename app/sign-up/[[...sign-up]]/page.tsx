import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-background p-4">
      <SignUp forceRedirectUrl="/marketplace" signInUrl="/sign-in" />
    </div>
  );
}
