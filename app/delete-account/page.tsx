"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

/**
 * Temporary utility page to delete your own account
 * This should be removed or secured in production
 */
export default function DeleteAccountPage() {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleDeleteAccount = async () => {
    if (!confirm("Are you absolutely sure? This will permanently delete your account and all associated data. This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      // Get current user
      const { data: { user }, error: userError } = await supabaseClient.auth.getUser();

      if (userError || !user) {
        setError("You must be logged in to delete your account.");
        setIsDeleting(false);
        return;
      }

      // Note: Regular users cannot delete themselves via the client
      // This would need to be done via Supabase Admin API or SQL
      // For now, we'll show instructions
      setError("Account deletion must be done via the Supabase Dashboard. Please see DELETE_ACCOUNT.md for instructions.");
      setIsDeleting(false);
      return;

      // The following code would work if you had admin privileges:
      // const { error: deleteError } = await supabaseClient.auth.admin.deleteUser(user.id);
      // if (deleteError) {
      //   setError(deleteError.message);
      //   setIsDeleting(false);
      //   return;
      // }

      // Sign out and redirect
      await supabaseClient.auth.signOut();
      setSuccess(true);
      setTimeout(() => {
        router.push("/auth/signup");
      }, 2000);
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setIsDeleting(false);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl py-12">
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Delete Account
          </CardTitle>
          <CardDescription>
            Permanently delete your account and all associated data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4">
              <div className="flex items-center gap-2 text-destructive mb-2">
                <AlertTriangle className="h-4 w-4" />
                <strong>Error</strong>
              </div>
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {success && (
            <div className="rounded-md border border-green-500 bg-green-50 dark:bg-green-950 p-4">
              <strong className="text-green-900 dark:text-green-100">Account Deleted</strong>
              <p className="text-sm text-green-800 dark:text-green-200 mt-1">
                Your account has been successfully deleted. Redirecting to signup...
              </p>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              <strong>Warning:</strong> This action cannot be undone. This will permanently delete:
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
              <li>Your user account</li>
              <li>Your profile information</li>
              <li>All logbook entries</li>
              <li>All progress records</li>
              <li>All other associated data</li>
            </ul>
          </div>

          <div className="pt-4">
            <p className="text-sm text-muted-foreground mb-4">
              <strong>To delete your account:</strong>
            </p>
            <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-2 ml-2">
              <li>Go to your Supabase Dashboard: <a href="https://app.supabase.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://app.supabase.com</a></li>
              <li>Navigate to <strong>Authentication</strong> → <strong>Users</strong></li>
              <li>Find your user account and click <strong>Delete</strong></li>
              <li>Confirm the deletion</li>
              <li>Come back here or go to <strong>/auth/signup</strong> to create a new account with role selection</li>
            </ol>
          </div>

          <div className="pt-4 border-t">
            <Button
              onClick={handleDeleteAccount}
              disabled={isDeleting || success}
              variant="destructive"
              className="w-full"
            >
              {isDeleting ? "Deleting..." : "I understand, delete my account"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
