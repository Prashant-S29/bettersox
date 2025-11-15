"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  SettingsIcon,
  Loader2Icon,
  SaveIcon,
  MoonIcon,
  SunIcon,
  MonitorIcon,
} from "lucide-react";
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
import { db, type UserPreferences } from "~/lib/storage";
import { toast } from "sonner";
import { useTheme } from "next-themes";

const SettingsPage: React.FC = () => {
  const router = useRouter();
  const { setTheme } = useTheme();
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

  useEffect(() => {
    void loadPreferences();
  }, []);

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

  // Check if preferences have changed
  const hasChanges = () => {
    return JSON.stringify(preferences) !== JSON.stringify(originalPreferences);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await db.setPreferences(preferences);
      setOriginalPreferences(preferences); // Update original after save
      toast.success("Settings saved successfully");
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleThemeChange = (value: "light" | "dark" | "system") => {
    // Immediately apply theme
    setTheme(value);
    // Update preferences state
    setPreferences({ ...preferences, theme: value });
  };

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

  const handleCancel = () => {
    if (hasChanges()) {
      if (
        confirm("You have unsaved changes. Are you sure you want to leave?")
      ) {
        // Revert theme to original
        setTheme(originalPreferences.theme);
        router.push("/");
      }
    } else {
      router.push("/");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto flex min-h-screen items-center justify-center py-8">
        <Loader2Icon className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 flex items-center gap-2 text-3xl font-bold">
          <SettingsIcon className="h-8 w-8" />
          Settings
        </h1>
        <p className="text-muted-foreground text-sm">
          Customize your BetterSOX experience
        </p>
      </div>

      <div className="space-y-8">
        {/* Appearance */}
        <section>
          <h2 className="mb-4 text-xl font-semibold">Appearance</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <Select
                value={preferences.theme}
                onValueChange={handleThemeChange}
              >
                <SelectTrigger id="theme">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <div className="flex items-center gap-2">
                      <SunIcon className="h-4 w-4" />
                      Light
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center gap-2">
                      <MoonIcon className="h-4 w-4" />
                      Dark
                    </div>
                  </SelectItem>
                  <SelectItem value="system">
                    <div className="flex items-center gap-2">
                      <MonitorIcon className="h-4 w-4" />
                      System
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-muted-foreground text-xs">
                Theme changes apply immediately
              </p>
            </div>
          </div>
        </section>

        <Separator />

        {/* Default Filters */}
        <section>
          <h2 className="mb-4 text-xl font-semibold">Default Filters</h2>
          <p className="text-muted-foreground mb-4 text-sm">
            Set default languages and frameworks to prefill in searches
          </p>

          <div className="space-y-4">
            {/* Languages */}
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

            {/* Frameworks */}
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

        <Separator />

        {/* Search Preferences */}
        <section>
          <h2 className="mb-4 text-xl font-semibold">Search Preferences</h2>

          <div className="space-y-4">
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

        <Separator />

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button onClick={handleSave} disabled={saving || !hasChanges()}>
            {saving ? (
              <>
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <SaveIcon className="mr-2 h-4 w-4" />
                Save Settings
              </>
            )}
          </Button>
          <Button onClick={handleCancel} variant="outline">
            Cancel
          </Button>
          {hasChanges() && (
            <span className="text-muted-foreground text-sm">
              You have unsaved changes
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
