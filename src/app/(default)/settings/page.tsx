"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

// icons
import { Loader2Icon } from "lucide-react";

// components
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";
import { toast } from "sonner";
import { Container } from "~/components/common";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";

// libs
import { db, type UserPreferences } from "~/lib/storage";

const SettingsPage: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [originalPreferences, setOriginalPreferences] =
    useState<UserPreferences>({
      id: "preferences",
      theme: "system",
      defaultLanguages: [],
      defaultFrameworks: [],
      sortBy: "stars",
      resultsPerPage: 20,
      showMissingFilters: true,
    });
  const [preferences, setPreferences] = useState<UserPreferences>({
    id: "preferences",
    theme: "system",
    defaultLanguages: [],
    defaultFrameworks: [],
    sortBy: "stars",
    resultsPerPage: 20,
    showMissingFilters: true,
  });

  const [languageInput, setLanguageInput] = useState("");
  const [frameworkInput, setFrameworkInput] = useState("");

  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(
    null,
  );

  useEffect(() => {
    void loadPreferences();
  }, []);

  const hasChanges = useCallback(() => {
    return JSON.stringify(preferences) !== JSON.stringify(originalPreferences);
  }, [preferences, originalPreferences]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges()) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasChanges]);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const prefs = await db.getPreferences();
      if (prefs) {
        setPreferences(prefs);
        setOriginalPreferences(prefs);
      }
    } catch (error) {
      console.error("Error loading preferences:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = useCallback(async () => {
    try {
      setSaving(true);
      await db.setPreferences(preferences);
      setOriginalPreferences(preferences);
      toast.success("Settings saved successfully");

      if (pendingNavigation) {
        router.push(pendingNavigation);
        setPendingNavigation(null);
      }
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  }, [pendingNavigation, preferences, router]);

  const handleDiscardChanges = useCallback(() => {
    setShowUnsavedDialog(false);
    if (pendingNavigation) {
      router.push(pendingNavigation);
      setPendingNavigation(null);
    }
  }, [pendingNavigation, router]);

  const handleSaveAndContinue = useCallback(async () => {
    setShowUnsavedDialog(false);
    await handleSave();
  }, [handleSave]);

  const handleAddLanguage = () => {
    if (
      languageInput.trim() &&
      !preferences.defaultLanguages.includes(languageInput.trim())
    ) {
      setPreferences({
        ...preferences,
        defaultLanguages: [
          ...preferences.defaultLanguages,
          languageInput.trim(),
        ],
      });
      setLanguageInput("");
    }
  };

  const handleRemoveLanguage = (lang: string) => {
    setPreferences({
      ...preferences,
      defaultLanguages: preferences.defaultLanguages.filter((l) => l !== lang),
    });
  };

  const handleAddFramework = () => {
    if (
      frameworkInput.trim() &&
      !preferences.defaultFrameworks.includes(frameworkInput.trim())
    ) {
      setPreferences({
        ...preferences,
        defaultFrameworks: [
          ...preferences.defaultFrameworks,
          frameworkInput.trim(),
        ],
      });
      setFrameworkInput("");
    }
  };

  const handleRemoveFramework = (fw: string) => {
    setPreferences({
      ...preferences,
      defaultFrameworks: preferences.defaultFrameworks.filter((f) => f !== fw),
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto flex min-h-screen items-center justify-center py-8">
        <Loader2Icon className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Container className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">Settings</h1>
            <p className="text-muted-foreground text-sm">
              Customize your BetterSox experience
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleSave}
              disabled={saving || !hasChanges()}
              size="sm"
            >
              {saving ? (
                <>
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : hasChanges() ? (
                "Save Settings (unsaved changes)"
              ) : (
                "Save Settings"
              )}
            </Button>
          </div>
        </div>

        <div className="space-y-8">
          <section className="bg-card flex flex-col rounded-lg border">
            <div className="px-6 py-5">
              <h2>Default Filters</h2>
              <p className="text-muted-foreground text-sm">
                Set default languages and frameworks to prefill in searches
              </p>
            </div>
            <Separator />
            <div className="flex flex-col gap-8 px-6 py-5">
              <div className="space-y-2">
                <Label htmlFor="languages">Default Languages</Label>
                <div className="flex gap-2">
                  <Input
                    id="languages"
                    placeholder="e.g., TypeScript, Python"
                    value={languageInput}
                    onChange={(e) => setLanguageInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddLanguage()}
                  />
                  <Button onClick={handleAddLanguage} variant="outline">
                    Add
                  </Button>
                </div>
                {preferences.defaultLanguages.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {preferences.defaultLanguages.map((lang) => (
                      <button
                        key={lang}
                        onClick={() => handleRemoveLanguage(lang)}
                        className="bg-secondary hover:bg-secondary/80 rounded-md px-3 py-1 text-sm transition-colors"
                      >
                        {lang} ×
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="frameworks">Default Frameworks</Label>
                <div className="flex gap-2">
                  <Input
                    id="frameworks"
                    placeholder="e.g., React, Next.js"
                    value={frameworkInput}
                    onChange={(e) => setFrameworkInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddFramework()}
                  />
                  <Button onClick={handleAddFramework} variant="outline">
                    Add
                  </Button>
                </div>
                {preferences.defaultFrameworks.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {preferences.defaultFrameworks.map((fw) => (
                      <button
                        key={fw}
                        onClick={() => handleRemoveFramework(fw)}
                        className="bg-secondary hover:bg-secondary/80 rounded-md px-3 py-1 text-sm transition-colors"
                      >
                        {fw} ×
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="bg-card flex flex-col rounded-lg border">
            <div className="px-6 py-5">
              <h2>Search Preferences</h2>
              <p className="text-muted-foreground text-sm">
                Customize your BetterSox experience
              </p>
            </div>
            <Separator />
            <div className="flex flex-col gap-8 px-6 py-5">
              <div className="space-y-2">
                <Label htmlFor="sortBy">Default Sort By</Label>
                <Select
                  value={preferences.sortBy}
                  onValueChange={(
                    value: "stars" | "forks" | "updated" | "created",
                  ) => setPreferences({ ...preferences, sortBy: value })}
                >
                  <SelectTrigger id="sortBy">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stars">Most Stars</SelectItem>
                    <SelectItem value="forks">Most Forks</SelectItem>
                    <SelectItem value="updated">Recently Updated</SelectItem>
                    <SelectItem value="created">Recently Created</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="resultsPerPage">Results Per Page</Label>
                <Input
                  id="resultsPerPage"
                  type="number"
                  min={10}
                  max={100}
                  step={10}
                  value={preferences.resultsPerPage}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      resultsPerPage: parseInt(e.target.value) || 20,
                    })
                  }
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="showMissingFilters"
                  checked={preferences.showMissingFilters}
                  onCheckedChange={(checked) =>
                    setPreferences({
                      ...preferences,
                      showMissingFilters: checked === true,
                    })
                  }
                />
                <Label htmlFor="showMissingFilters" className="cursor-pointer">
                  Show missing filter warnings on repository cards
                </Label>
              </div>
            </div>
          </section>
        </div>
      </Container>

      <AlertDialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>You have unsaved changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes that will be lost if you leave this page.
              Would you like to save them before continuing?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDiscardChanges}>
              Discard Changes
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleSaveAndContinue}>
              Save Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default SettingsPage;
