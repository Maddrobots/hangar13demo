"use server";

import { createServerSupabaseClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

export async function approveLogbookEntry(entryId: string) {
  const supabase = await createServerSupabaseClient();

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "You must be logged in to approve entries." };
  }

  // Verify the user is a mentor with permission to approve this entry
  const { data: entry, error: entryError } = await supabase
    .from("logbook_entries")
    .select(
      `
      *,
      apprentices:apprentice_id (
        id,
        mentor_id
      )
    `
    )
    .eq("id", entryId)
    .single();

  if (entryError || !entry) {
    return { error: "Entry not found." };
  }

  // Check if user is the mentor for this apprentice
  const apprentice = entry.apprentices as any;
  if (apprentice?.mentor_id !== user.id) {
    return {
      error: "You don't have permission to approve this entry.",
    };
  }

  // Store apprentice ID before update
  const apprenticeId = apprentice?.id;

  // Update entry status to approved
  const { error: updateError } = await supabase
    .from("logbook_entries")
    .update({
      status: "approved",
      approved_by: user.id,
      approved_at: new Date().toISOString(),
    })
    .eq("id", entryId);

  if (updateError) {
    return { error: updateError.message || "Failed to approve entry." };
  }

  // Revalidate mentor dashboard and apprentice detail pages
  revalidatePath("/dashboard/mentor");
  if (apprenticeId) {
    revalidatePath(`/dashboard/mentor/apprentice/${apprenticeId}`);
  }

  return { success: true };
}

export async function rejectLogbookEntry(entryId: string) {
  const supabase = await createServerSupabaseClient();

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "You must be logged in to reject entries." };
  }

  // Verify the user is a mentor with permission to reject this entry
  const { data: entry, error: entryError } = await supabase
    .from("logbook_entries")
    .select(
      `
      *,
      apprentices:apprentice_id (
        id,
        mentor_id
      )
    `
    )
    .eq("id", entryId)
    .single();

  if (entryError || !entry) {
    return { error: "Entry not found." };
  }

  // Check if user is the mentor for this apprentice
  const apprentice = entry.apprentices as any;
  if (apprentice?.mentor_id !== user.id) {
    return {
      error: "You don't have permission to reject this entry.",
    };
  }

  // Store apprentice ID before update
  const apprenticeId = apprentice?.id;

  // Update entry status to rejected
  const { error: updateError } = await supabase
    .from("logbook_entries")
    .update({
      status: "rejected",
    })
    .eq("id", entryId);

  if (updateError) {
    return { error: updateError.message || "Failed to reject entry." };
  }

  // Revalidate mentor dashboard and apprentice detail pages
  revalidatePath("/dashboard/mentor");
  if (apprenticeId) {
    revalidatePath(`/dashboard/mentor/apprentice/${apprenticeId}`);
  }

  return { success: true };
}

