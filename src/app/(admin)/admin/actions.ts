"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { contactMessages } from "@/db/schema";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/supabase/config";

/**
 * Server actions are reachable endpoints, so they re-check the session
 * rather than trusting that middleware ran. Middleware is routing, not
 * authorisation.
 */
async function assertAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!isAdminEmail(user?.email)) throw new Error("Not authorised.");
}

export async function setHandled(id: string, handled: boolean) {
  await assertAdmin();
  await getDb()
    .update(contactMessages)
    .set({ handled })
    .where(eq(contactMessages.id, id));
  revalidatePath("/admin");
}
