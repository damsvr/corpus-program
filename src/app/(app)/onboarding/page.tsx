import { requireUser } from "@/lib/session";
import { Quiz } from "./quiz";

export const metadata = { title: "Choisir mon profil — Corpus Program" };

export default async function OnboardingPage() {
  await requireUser();
  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow !text-brand">Choisir</p>
        <h1 className="mt-1 text-4xl font-extrabold uppercase leading-tight">
          Trois questions. <span className="grad-text">Pas dix.</span>
        </h1>
      </div>
      <Quiz />
    </div>
  );
}
