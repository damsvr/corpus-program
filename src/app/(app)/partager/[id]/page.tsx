import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/session";
import { loadShareData } from "@/lib/share-data";
import { SharePanel } from "./share-panel";

export const metadata = { title: "Partager — Corpus Program" };

export default async function PartagerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const data = await loadShareData(user.id, id);
  if (!data) notFound();

  return (
    <div className="space-y-6">
      <Link href="/historique" className="eyebrow !text-brand">
        ← Historique
      </Link>
      <div>
        <p className="eyebrow !text-brand">Partager ma séance</p>
        <h1 className="mt-1 text-3xl font-extrabold uppercase leading-tight">
          {data.profileLabel} · {data.patternLabel}
        </h1>
        <p className="mt-1 text-sm text-muted">{data.date}</p>
      </div>
      <SharePanel sessionId={id} />
    </div>
  );
}
