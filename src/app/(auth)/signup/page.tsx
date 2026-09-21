import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Brand } from "@/components/brand";
import { AuthForm } from "../auth-form";
import { signup } from "../actions";

export const metadata = { title: "Créer un compte — Corpus Program" };

export default async function SignupPage() {
  if ((await auth())?.user) redirect("/aujourdhui");
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-10 px-6 py-12">
      <Brand />
      <AuthForm mode="signup" action={signup} />
    </main>
  );
}
