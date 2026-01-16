"use server";

import { createServerSupabaseClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

export async function createLogbookEntry(formData: {
  entryDate: string;
  startTime: string;
  endTime: string;
  hoursWorked: number;
  taskDescription: string;
  ataChapter: string;
  certified: boolean;
}) {
  const supabase = await createServerSupabaseClient();

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "You must be logged in to create logbook entries." };
  }

  // Get apprentice record
  const { data: apprentice, error: apprenticeError } = await supabase
    .from("apprentices")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (apprenticeError || !apprentice) {
    return {
      error: "Apprentice record not found. Please contact your administrator.",
    };
  }

  // Find the ATA chapter label
  const ataChapters: Record<string, string> = {
    "00": "00 - General",
    "05": "05 - Time Limits/Maintenance Checks",
    "06": "06 - Dimensions & Areas",
    "07": "07 - Lifting & Shoring",
    "08": "08 - Leveling & Weighing",
    "09": "09 - Towing & Taxiing",
    "10": "10 - Parking, Mooring, Storage",
    "11": "11 - Placards & Markings",
    "12": "12 - Servicing",
    "20": "20 - Standard Practices - Airframe",
    "21": "21 - Air Conditioning",
    "23": "23 - Communications",
    "24": "24 - Electrical Power",
    "25": "25 - Equipment/Furnishings",
    "26": "26 - Fire Protection",
    "27": "27 - Flight Controls",
    "28": "28 - Fuel",
    "29": "29 - Hydraulic Power",
    "30": "30 - Ice & Rain Protection",
    "31": "31 - Indicating/Recording Systems",
    "32": "32 - Landing Gear",
    "33": "33 - Lights",
    "34": "34 - Navigation",
    "35": "35 - Oxygen",
    "36": "36 - Pneumatic",
    "38": "38 - Water/Waste",
    "49": "49 - Airborne Auxiliary Power",
    "51": "51 - Structures",
    "52": "52 - Doors",
    "53": "53 - Fuselage",
    "54": "54 - Nacelles/Pylons",
    "55": "55 - Stabilizers",
    "56": "56 - Windows",
    "57": "57 - Wings",
    "61": "61 - Propellers/Propulsors",
    "71": "71 - Powerplant",
    "72": "72 - Engine - Turbine/Turbo Prop",
    "73": "73 - Engine Fuel & Control",
    "74": "74 - Ignition",
    "75": "75 - Air",
    "76": "76 - Engine Controls",
    "77": "77 - Engine Indicating",
    "78": "78 - Exhaust",
    "79": "79 - Oil",
    "80": "80 - Starting",
    "91": "91 - Charts",
  };

  const ataLabel = ataChapters[formData.ataChapter] || formData.ataChapter;

  // Store ATA chapter info in skills_practiced array for now (we can add a dedicated column later)
  // Store description, and status based on certification
  const status = formData.certified ? "submitted" : "draft";

  // Create logbook entry
  const { data: entry, error: entryError } = await supabase
    .from("logbook_entries")
    .insert({
      apprentice_id: apprentice.id,
      entry_date: formData.entryDate,
      hours_worked: formData.hoursWorked,
      description: formData.taskDescription,
      skills_practiced: [`ATA: ${ataLabel}`], // Store ATA chapter in skills_practiced for now
      status: status,
    })
    .select()
    .single();

  if (entryError) {
    return { error: entryError.message || "Failed to create logbook entry." };
  }

  // Revalidate the logbook and dashboard pages to show new entry
  revalidatePath("/dashboard/apprentice/logbook");
  revalidatePath("/dashboard/apprentice");

  return { success: true, data: entry };
}

export async function updateLogbookEntry(
  entryId: string,
  formData: {
    entryDate: string;
    startTime: string;
    endTime: string;
    hoursWorked: number;
    taskDescription: string;
    ataChapter: string;
    certified: boolean;
  }
) {
  const supabase = await createServerSupabaseClient();

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "You must be logged in to update logbook entries." };
  }

  // Get apprentice record
  const { data: apprentice, error: apprenticeError } = await supabase
    .from("apprentices")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (apprenticeError || !apprentice) {
    return {
      error: "Apprentice record not found. Please contact your administrator.",
    };
  }

  // Verify the entry belongs to this apprentice and is a draft
  const { data: existingEntry, error: fetchError } = await supabase
    .from("logbook_entries")
    .select("apprentice_id, status")
    .eq("id", entryId)
    .single();

  if (fetchError || !existingEntry) {
    return { error: "Entry not found." };
  }

  if (existingEntry.apprentice_id !== apprentice.id) {
    return {
      error: "You don't have permission to update this entry.",
    };
  }

  if (existingEntry.status !== "draft") {
    return {
      error: "Only draft entries can be edited.",
    };
  }

  // Find the ATA chapter label
  const ataChapters: Record<string, string> = {
    "00": "00 - General",
    "05": "05 - Time Limits/Maintenance Checks",
    "06": "06 - Dimensions & Areas",
    "07": "07 - Lifting & Shoring",
    "08": "08 - Leveling & Weighing",
    "09": "09 - Towing & Taxiing",
    "10": "10 - Parking, Mooring, Storage",
    "11": "11 - Placards & Markings",
    "12": "12 - Servicing",
    "20": "20 - Standard Practices - Airframe",
    "21": "21 - Air Conditioning",
    "23": "23 - Communications",
    "24": "24 - Electrical Power",
    "25": "25 - Equipment/Furnishings",
    "26": "26 - Fire Protection",
    "27": "27 - Flight Controls",
    "28": "28 - Fuel",
    "29": "29 - Hydraulic Power",
    "30": "30 - Ice & Rain Protection",
    "31": "31 - Indicating/Recording Systems",
    "32": "32 - Landing Gear",
    "33": "33 - Lights",
    "34": "34 - Navigation",
    "35": "35 - Oxygen",
    "36": "36 - Pneumatic",
    "38": "38 - Water/Waste",
    "49": "49 - Airborne Auxiliary Power",
    "51": "51 - Structures",
    "52": "52 - Doors",
    "53": "53 - Fuselage",
    "54": "54 - Nacelles/Pylons",
    "55": "55 - Stabilizers",
    "56": "56 - Windows",
    "57": "57 - Wings",
    "61": "61 - Propellers/Propulsors",
    "71": "71 - Powerplant",
    "72": "72 - Engine - Turbine/Turbo Prop",
    "73": "73 - Engine Fuel & Control",
    "74": "74 - Ignition",
    "75": "75 - Air",
    "76": "76 - Engine Controls",
    "77": "77 - Engine Indicating",
    "78": "78 - Exhaust",
    "79": "79 - Oil",
    "80": "80 - Starting",
    "91": "91 - Charts",
  };

  const ataLabel = ataChapters[formData.ataChapter] || formData.ataChapter;

  // Store ATA chapter info in skills_practiced array for now (we can add a dedicated column later)
  // Store description, and status based on certification
  const status = formData.certified ? "submitted" : "draft";

  // Update logbook entry
  const { data: entry, error: entryError } = await supabase
    .from("logbook_entries")
    .update({
      entry_date: formData.entryDate,
      hours_worked: formData.hoursWorked,
      description: formData.taskDescription,
      skills_practiced: [`ATA: ${ataLabel}`],
      status: status,
    })
    .eq("id", entryId)
    .select()
    .single();

  if (entryError) {
    return { error: entryError.message || "Failed to update logbook entry." };
  }

  // Revalidate the logbook and dashboard pages to show updated entry
  revalidatePath("/dashboard/apprentice/logbook");
  revalidatePath("/dashboard/apprentice");

  return { success: true, data: entry };
}

