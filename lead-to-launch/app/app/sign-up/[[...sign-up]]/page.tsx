import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 px-4 py-12">
      <Link href="/" aria-label="Outrive home"><Logo /></Link>
      <SignUp />
    </div>
  );
}
