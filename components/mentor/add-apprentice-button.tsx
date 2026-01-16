"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AddApprenticeModal } from "@/components/mentor/add-apprentice-modal";
import { Plus } from "lucide-react";

interface AddApprenticeButtonProps {
  mentorId: string;
}

export function AddApprenticeButton({ mentorId }: AddApprenticeButtonProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleSuccess = () => {
    // Refresh the page to show the newly assigned apprentice
    router.refresh();
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Add Apprentice
      </Button>
      <AddApprenticeModal
        open={open}
        onOpenChange={setOpen}
        currentMentorId={mentorId}
        onSuccess={handleSuccess}
      />
    </>
  );
}
