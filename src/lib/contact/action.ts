"use server";

import { z } from "zod";
import { createPocketBase } from "@/lib/pocketbase/client";

const schema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  message: z.string().min(1).max(5000),
  locale: z.enum(["en", "fr"]).catch("en"),
});

export type ContactState = { status: "idle" | "success" | "error" };

/** Envío del email vía Resend, solo si está configurado. Best-effort: nunca
 *  hace fallar la acción (el mensaje ya quedó persistido en el CMS). */
async function sendContactEmail(data: z.infer<typeof schema>): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL;
  if (!key || !to || !from) return; // no configurado → solo persistencia

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      reply_to: data.email,
      subject: `New contact from ${data.name}`,
      text: `From: ${data.name} <${data.email}>\nLocale: ${data.locale}\n\n${data.message}`,
    }),
  });
}

export async function submitContact(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  // Honeypot: si un bot llenó el campo oculto, fingimos éxito sin persistir.
  if (formData.get("company")) return { status: "success" };

  const parsed = schema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    message: formData.get("message"),
    locale: formData.get("locale"),
  });
  if (!parsed.success) return { status: "error" };

  try {
    const pb = createPocketBase();
    await pb.collection("contact_messages").create(parsed.data);
  } catch {
    return { status: "error" };
  }

  await sendContactEmail(parsed.data).catch(() => {});
  return { status: "success" };
}
