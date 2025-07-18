"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = createClient();

  const { error } = await (await supabase).auth.signInWithPassword({
    email,
    password,
  });

  console.log(error)

  if (error) {
    return { error: "Les identifiants sont incorrects." };
  }

  revalidatePath("/", "layout");
  redirect("/profile");
}

export async function signup(formData: FormData) {
  const origin = (await headers()).get("origin");
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullName") as string;
  const phoneNumber = formData.get("phoneNumber") as string;
  const supabase = createClient();

  const { error } = await (await supabase).auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
        full_name: fullName,
        phone_number: phoneNumber,
      }
    },
  });

  if (error) {
    return { error: "Impossible de créer le compte. L'utilisateur existe peut-être déjà." };
  }

  return { error: null };
}

export async function logout() {
  const supabase = createClient();
  await (await supabase).auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
