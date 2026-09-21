import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Brand } from "@/components/brand";
import { AuthForm } from "../auth-form";
import { login } from "../actions";

export const metadata = { title: "Connexion — Corpus Program" };

export default async function LoginPage() {
  if ((await auth())?.user) redirect("/aujourdhui");
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-10 px-6 py-12">
      <Brand />
      <AuthForm mode="login" action={login} />
    </main>
  );
}
