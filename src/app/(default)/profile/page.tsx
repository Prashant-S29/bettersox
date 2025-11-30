"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  memo,
  useTransition,
  useRef,
} from "react";
import { useRouter } from "next/navigation";

// types
import type { ProfileFormData } from "~/types";

// icons
import { Loader2Icon, PlusIcon, XIcon } from "lucide-react";

// libs
import { api } from "~/trpc/react";
import { db, type UserProfile, type Skill } from "~/lib/storage";
import { extractTextFromPDF, validatePDFFile } from "~/lib/utils/pdf-parser";
import { categorizeSkill } from "~/lib/storage/user-profile-helpers";

// components
import { Container } from "~/components/common";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { toast } from "sonner";
import { Badge } from "~/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
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

const initialFormData: ProfileFormData = {
  fullName: "",
  email: "",
  phone: "",
  location: "",
  portfolio: "",
  github: "",
  linkedin: "",
  headline: "",
  bio: "",
  yearsOfExperience: "",
  experienceLevel: "beginner",
  skills: [],
  interests: [],
  resumeFileName: undefined,
};

const SkillBadge = memo(
  ({ skill, onRemove }: { skill: Skill; onRemove: (name: string) => void }) => (
    <Badge variant="secondary" className="flex items-center gap-1">
      {skill.name}
      <button
        onClick={() => onRemove(skill.name)}
        className="hover:bg-destructive/20 ml-1 rounded-full"
        aria-label={`Remove ${skill.name}`}
        type="button"
      >
        <XIcon className="h-3 w-3" />
      </button>
    </Badge>
  ),
);
SkillBadge.displayName = "SkillBadge";

const InterestBadge = memo(
  ({
    interest,
    onRemove,
  }: {
    interest: string;
    onRemove: (interest: string) => void;
  }) => (
    <Badge variant="outline" className="flex items-center gap-1">
      {interest}
      <button
        onClick={() => onRemove(interest)}
        className="hover:bg-destructive/20 ml-1 rounded-full"
        aria-label={`Remove ${interest}`}
        type="button"
      >
        <XIcon className="h-3 w-3" />
      </button>
    </Badge>
  ),
);
InterestBadge.displayName = "InterestBadge";

const ProfilePage: React.FC = () => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [, startTransition] = useTransition();
  const [profileData, setProfileData] =
    useState<ProfileFormData>(initialFormData);
  const [originalData, setOriginalData] =
    useState<ProfileFormData>(initialFormData);
  const [newSkillInput, setNewSkillInput] = useState("");
  const [newInterestInput, setNewInterestInput] = useState("");
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(
    null,
  );

  // mutations
  const parseResumeMutation = api.resumeParser.parseResume.useMutation();

  const hasUnsavedChanges = useMemo(() => {
    return JSON.stringify(profileData) !== JSON.stringify(originalData);
  }, [profileData, originalData]);

  useEffect(() => {
    void loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      const profile = await db.getUserProfile();

      const data: ProfileFormData = profile
        ? {
            fullName: profile.fullName,
            email: profile.email ?? "",
            phone: profile.phone ?? "",
            location: profile.location ?? "",
            portfolio: profile.portfolio ?? "",
            github: profile.github ?? "",
            linkedin: profile.linkedin ?? "",
            headline: profile.headline ?? "",
            bio: profile.bio ?? "",
            yearsOfExperience: profile.yearsOfExperience?.toString() ?? "",
            experienceLevel: profile.experienceLevel,
            skills: profile.skills,
            interests: profile.interests,
            resumeFileName: profile.resumeFileName,
          }
        : initialFormData;

      setProfileData(data);
      setOriginalData(data);
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, []);

  const updateField = useCallback(
    <K extends keyof ProfileFormData>(field: K, value: ProfileFormData[K]) => {
      startTransition(() => {
        setProfileData((prev) => ({ ...prev, [field]: value }));
      });
    },
    [],
  );

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleSave = useCallback(async () => {
    const trimmedName = profileData.fullName.trim();

    if (!trimmedName) {
      toast.error("Please enter your name");
      return;
    }

    if (profileData.skills.length === 0) {
      toast.error("Please add at least one skill");
      return;
    }

    try {
      setSaving(true);

      const now = Date.now();
      const profile: UserProfile = {
        id: "user_profile",
        fullName: trimmedName,
        email: profileData.email.trim() || undefined,
        phone: profileData.phone.trim() || undefined,
        location: profileData.location.trim() || undefined,
        portfolio: profileData.portfolio.trim() || undefined,
        github: profileData.github.trim() || undefined,
        linkedin: profileData.linkedin.trim() || undefined,
        headline: profileData.headline.trim() || undefined,
        bio: profileData.bio.trim() || undefined,
        yearsOfExperience: profileData.yearsOfExperience
          ? parseInt(profileData.yearsOfExperience, 10)
          : undefined,
        experienceLevel: profileData.experienceLevel,
        skills: profileData.skills,
        workExperience: [],
        education: [],
        projects: [],
        interests: profileData.interests,
        preferredProjectTypes: [],
        preferredContributionTypes: [],
        resumeFileName: profileData.resumeFileName,
        resumeUploadedAt: profileData.resumeFileName ? now : undefined,
        isComplete: true,
        lastUpdatedAt: now,
        createdAt: now,
        source: profileData.resumeFileName ? "resume" : "manual",
      };

      await db.setUserProfile(profile);

      setOriginalData(profileData);

      toast.success("Profile saved successfully!");

      if (pendingNavigation) {
        router.push(pendingNavigation);
        setPendingNavigation(null);
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  }, [profileData, pendingNavigation, router]);

  const handleResetProfile = useCallback(async () => {
    if (
      !confirm(
        "Are you sure you want to reset your profile? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      await db.deleteUserProfile();
      toast.success("Profile reset successfully");
      setProfileData(initialFormData);
      setOriginalData(initialFormData);
    } catch (error) {
      console.error("Error resetting profile:", error);
      toast.error("Failed to reset profile");
    }
  }, []);

  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const validation = validatePDFFile(file);
      if (!validation.isValid) {
        toast.error(validation.error);
        return;
      }

      try {
        setUploading(true);

        const resumeText = await extractTextFromPDF(file);

        if (resumeText.length < 100) {
          toast.error(
            "Resume text is too short. Please upload a valid resume.",
          );
          return;
        }

        const result = await parseResumeMutation.mutateAsync({
          resumeText,
          fileName: file.name,
        });

        if (result.warnings.length > 0) {
          toast.warning(`Parsed with warnings: ${result.warnings.join(", ")}`);
        }

        const p = result.profile;
        setProfileData({
          fullName: p.fullName ?? "",
          email: p.email ?? "",
          phone: p.phone ?? "",
          location: p.location ?? "",
          portfolio: p.portfolio ?? "",
          github: p.github ?? "",
          linkedin: p.linkedin ?? "",
          headline: p.headline ?? "",
          bio: p.bio ?? "",
          yearsOfExperience: p.yearsOfExperience?.toString() ?? "",
          experienceLevel: p.experienceLevel ?? "beginner",
          skills: p.skills.map((skill) => ({
            name: skill.name,
            category: skill.category,
          })),
          interests: p.interests,
          resumeFileName: file.name,
        });

        toast.success(
          "Resume parsed successfully! Review and save your profile.",
        );
      } catch (error) {
        console.error("Error uploading resume:", error);
        toast.error("Failed to parse resume. Please try again.");
      } finally {
        setUploading(false);
        event.target.value = "";
      }
    },
    [parseResumeMutation],
  );

  const handleAddSkill = useCallback(() => {
    const skillName = newSkillInput.trim();
    if (!skillName) return;

    const lowerSkillName = skillName.toLowerCase();
    if (
      profileData.skills.some((s) => s.name.toLowerCase() === lowerSkillName)
    ) {
      toast.error("Skill already added");
      return;
    }

    const category = categorizeSkill(skillName);
    setProfileData((prev) => ({
      ...prev,
      skills: [...prev.skills, { name: skillName, category }],
    }));
    setNewSkillInput("");
  }, [newSkillInput, profileData.skills]);

  const handleRemoveSkill = useCallback((skillName: string) => {
    setProfileData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s.name !== skillName),
    }));
  }, []);

  const handleAddInterest = useCallback(() => {
    const interest = newInterestInput.trim();
    if (!interest) return;

    const lowerInterest = interest.toLowerCase();
    if (profileData.interests.some((i) => i.toLowerCase() === lowerInterest)) {
      toast.error("Interest already added");
      return;
    }

    setProfileData((prev) => ({
      ...prev,
      interests: [...prev.interests, interest],
    }));
    setNewInterestInput("");
  }, [newInterestInput, profileData.interests]);

  const handleRemoveInterest = useCallback((interest: string) => {
    setProfileData((prev) => ({
      ...prev,
      interests: prev.interests.filter((i) => i !== interest),
    }));
  }, []);

  const handleSkillKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleAddSkill();
      }
    },
    [handleAddSkill],
  );

  const handleInterestKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleAddInterest();
      }
    },
    [handleAddInterest],
  );

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

  const isDisabled = useMemo(() => saving || uploading, [saving, uploading]);

  if (loading) {
    return (
      <Container className="flex min-h-screen items-center justify-center">
        <Loader2Icon className="text-primary h-8 w-8 animate-spin" />
      </Container>
    );
  }

  return (
    <>
      <Container className="flex flex-col gap-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">Your Profile</h1>
            <p className="text-muted-foreground text-sm">
              Manage your professional information
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetProfile}
              disabled={isDisabled}
              aria-label="Reset your profile to default"
            >
              Reset Profile
            </Button>

            <Button
              onClick={handleSave}
              disabled={isDisabled || !hasUnsavedChanges}
              size="sm"
            >
              {saving ? (
                <>
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : hasUnsavedChanges ? (
                "Save Profile (unsaved changes)"
              ) : (
                "Save Profile"
              )}
            </Button>
          </div>
        </header>

        <section className="bg-sidebar rounded-lg border p-6">
          {profileData.resumeFileName ? (
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-medium">
                  Reading data from{" "}
                  <span className="text-muted-foreground">
                    {profileData.resumeFileName}
                  </span>
                </h2>
                <p className="text-muted-foreground text-sm">
                  Upload your resume to update your profile
                </p>
              </div>

              <Button
                disabled={uploading}
                variant="outline"
                loading={uploading}
                size="sm"
                onClick={handleUploadClick}
              >
                {uploading ? "Parsing..." : "Update Resume"}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="hidden"
                disabled={uploading}
                aria-label="Upload new resume PDF"
              />
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-medium">Fill from Resume</h2>
                <p className="text-muted-foreground text-sm">
                  Upload your resume to update your profile
                </p>
              </div>

              <Button
                disabled={uploading}
                loading={uploading}
                variant="outline"
                size="sm"
                onClick={handleUploadClick}
              >
                {uploading ? "Parsing..." : "Upload Resume"}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="hidden"
                disabled={uploading}
                aria-label="Upload resume PDF"
              />
            </div>
          )}
        </section>

        <section className="bg-sidebar rounded-lg border">
          <div className="px-6 pt-5 pb-4">
            <h2 id="personal-info">Personal Information</h2>
          </div>
          <Separator />
          <div className="grid gap-4 px-6 py-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fullName">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="fullName"
                name="fullName"
                placeholder="John Doe"
                value={profileData.fullName}
                onChange={(e) => updateField("fullName", e.target.value)}
                autoComplete="name"
                required
                aria-required="true"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="john@example.com"
                value={profileData.email}
                onChange={(e) => updateField("email", e.target.value)}
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={profileData.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                autoComplete="tel"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                placeholder="San Francisco, CA"
                value={profileData.location}
                onChange={(e) => updateField("location", e.target.value)}
                autoComplete="address-level2"
              />
            </div>
          </div>
        </section>

        <section className="bg-sidebar rounded-lg border">
          <div className="px-6 pt-5 pb-4">
            <h2 id="professional-info">Professional Information</h2>
          </div>
          <Separator />
          <div className="space-y-4 px-6 py-5">
            <div className="space-y-2">
              <Label htmlFor="headline">Headline</Label>
              <Input
                id="headline"
                name="headline"
                placeholder="Full-stack Developer | React & Node.js"
                value={profileData.headline}
                onChange={(e) => updateField("headline", e.target.value)}
                autoComplete="organization-title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                name="bio"
                placeholder="Tell us about yourself and your experience..."
                value={profileData.bio}
                onChange={(e) => updateField("bio", e.target.value)}
                rows={4}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="yearsOfExperience">Years of Experience</Label>
                <Input
                  id="yearsOfExperience"
                  name="yearsOfExperience"
                  type="number"
                  min="0"
                  max="50"
                  placeholder="5"
                  value={profileData.yearsOfExperience}
                  onChange={(e) =>
                    updateField("yearsOfExperience", e.target.value)
                  }
                  inputMode="numeric"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experienceLevel">Experience Level</Label>
                <Select
                  value={profileData.experienceLevel}
                  onValueChange={(value) =>
                    updateField(
                      "experienceLevel",
                      value as ProfileFormData["experienceLevel"],
                    )
                  }
                >
                  <SelectTrigger id="experienceLevel">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-sidebar rounded-lg border">
          <div className="px-6 pt-5 pb-4">
            <h2 id="skills-section">
              Skills <span className="text-destructive">*</span>
            </h2>
          </div>
          <Separator />
          <div className="flex flex-col gap-4 px-6 py-5">
            <div className="flex gap-2">
              <Input
                placeholder="Add a skill (e.g., React, Python, Docker)"
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                onKeyDown={handleSkillKeyDown}
                aria-label="Add new skill"
              />
              <Button
                onClick={handleAddSkill}
                variant="secondary"
                aria-label="Add skill"
              >
                <PlusIcon className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
            {profileData.skills.length > 0 ? (
              <div
                className="flex flex-wrap gap-2"
                role="list"
                aria-label="Your skills"
              >
                {profileData.skills.map((skill) => (
                  <SkillBadge
                    key={skill.name}
                    skill={skill}
                    onRemove={handleRemoveSkill}
                  />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground px-1 text-sm">
                No skills added yet. Add at least one skill.
              </p>
            )}
          </div>
        </section>

        <section className="bg-sidebar rounded-lg border">
          <div className="px-6 pt-5 pb-4">
            <h2 id="interests-section">Interests & Topics</h2>
          </div>
          <Separator />

          <div className="flex flex-col gap-4 px-6 py-5">
            <div className="flex gap-2">
              <Input
                placeholder="Add an interest (e.g., web development, machine learning)"
                value={newInterestInput}
                onChange={(e) => setNewInterestInput(e.target.value)}
                onKeyDown={handleInterestKeyDown}
                aria-label="Add new interest"
              />
              <Button
                onClick={handleAddInterest}
                variant="secondary"
                aria-label="Add interest"
              >
                <PlusIcon className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
            {profileData.interests.length > 0 ? (
              <div
                className="flex flex-wrap gap-2"
                role="list"
                aria-label="Your interests"
              >
                {profileData.interests.map((interest) => (
                  <InterestBadge
                    key={interest}
                    interest={interest}
                    onRemove={handleRemoveInterest}
                  />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground px-1 text-sm">
                No interests added yet.
              </p>
            )}
          </div>
        </section>

        <section className="bg-sidebar rounded-lg border">
          <div className="px-6 pt-5 pb-4">
            <h2 id="links-section">Links</h2>
          </div>
          <Separator />
          <div className="space-y-4 px-6 py-5">
            <div className="space-y-2">
              <Label htmlFor="portfolio">Portfolio Website</Label>
              <Input
                id="portfolio"
                name="portfolio"
                type="url"
                placeholder="https://johndoe.com"
                value={profileData.portfolio}
                onChange={(e) => updateField("portfolio", e.target.value)}
                autoComplete="url"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="github">GitHub</Label>
              <Input
                id="github"
                name="github"
                type="url"
                placeholder="https://github.com/johndoe"
                value={profileData.github}
                onChange={(e) => updateField("github", e.target.value)}
                autoComplete="url"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input
                id="linkedin"
                name="linkedin"
                type="url"
                placeholder="https://linkedin.com/in/johndoe"
                value={profileData.linkedin}
                onChange={(e) => updateField("linkedin", e.target.value)}
                autoComplete="url"
              />
            </div>
          </div>
        </section>
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

export default ProfilePage;
