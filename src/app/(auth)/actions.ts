"use server";

import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { signIn } from "@/auth";
import { db } from "@/lib/db";
import { isCoachEmail } from "@/lib/roles";

export type FormState = { error?: string } | undefined;

const loginSchema = z.object({
  email: z.string().email("E-mail invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

const signupSchema = z.object({
  name: z.string().trim().max(80).optional(),
  email: z.string().email("E-mail invalide"),
  password: z.string().min(8, "8 caractères minimum"),
});

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  try {
    await signIn("credentials", {
      email: parsed.data.email.toLowerCase().trim(),
      password: parsed.data.password,
      redirectTo: "/aujourdhui",
    });
  } catch (e) {
    if (e instanceof AuthError) return { error: "E-mail ou mot de passe incorrect" };
    throw e;
  }
}

export async function signup(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = signupSchema.safeParse({
    name: formData.get("name") || undefined,
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const email = parsed.data.email.toLowerCase().trim();
  const exists = await db.user.findUnique({ where: { email } });
  if (exists) return { error: "Un compte existe déjà avec cet e-mail" };

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  await db.user.create({
    data: {
      email,
      passwordHash,
      name: parsed.data.name,
      role: isCoachEmail(email) ? "COACH" : "ATHLETE",
      prs: { create: {} },
      athlete: { create: {} },
    },
  });

  try {
    await signIn("credentials", { email, password: parsed.data.password, redirectTo: "/onboarding" });
  } catch (e) {
    if (e instanceof AuthError) return { error: "Compte créé, mais la connexion a échoué. Connecte-toi." };
    throw e;
  }
}
