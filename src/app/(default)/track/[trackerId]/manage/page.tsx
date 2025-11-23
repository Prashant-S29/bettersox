"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "~/trpc/react";

// rhf & zod
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// schema
import {
  createTrackerSchema,
  type CreateTrackerInput,
} from "~/schema/zod.schema.tracker";

// types
import { PR_EVENTS, ISSUE_EVENTS, GITHUB_LABELS } from "~/types/types.tracker";

// icons
import { ChevronLeft, AlertTriangleIcon } from "lucide-react";
import Link from "next/link";

// components
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { toast } from "sonner";
import { Container } from "~/components/common";
import { Separator } from "~/components/ui/separator";
import { Badge } from "~/components/ui/badge";
import { Switch } from "~/components/ui/switch";
import { Skeleton } from "~/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";

const ManageTracker: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const trackerId = params.trackerId as string;
  const utils = api.useUtils();

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showPrSection, setShowPrSection] = useState(false);
  const [showIssueSection, setShowIssueSection] = useState(false);
  const [showAdditionalSection, setShowAdditionalSection] = useState(false);
  const [branchWarning, setBranchWarning] = useState<string | null>(null);

  const { data: trackerData, isLoading: isLoadingTracker } =
    api.tracker.getTracker.useQuery();

  const { data: repoMetadata, isLoading: isLoadingMetadata } =
    api.tracker.verifyRepo.useQuery(
      {
        repoUrl: trackerData?.data?.repoUrl ?? "",
      },
      {
        enabled: !!trackerData?.data?.repoUrl,
      },
    );

  const updateMutation = api.tracker.updatePreferences.useMutation({
    onSuccess: (result) => {
      if (result.error) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      setHasUnsavedChanges(false);
      void utils.tracker.getTracker.invalidate();
      router.push(`/track/${trackerId}`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const configForm = useForm<CreateTrackerInput>({
    resolver: zodResolver(createTrackerSchema),
    defaultValues: {
      repoUrl: "",
      prEvent: "none",
      prTargetBranch: undefined,
      issueEvent: "none",
      issueTag: undefined,
      trackNewContributor: false,
      trackNewFork: false,
      trackNewRelease: false,
      enableAiSummary: false,
    },
  });

  const tracker = trackerData?.data;
  const metadata = repoMetadata?.data;

  useEffect(() => {
    if (!tracker) return;

    const events = tracker.trackedEvents;
    const formValues: Partial<CreateTrackerInput> = {
      repoUrl: tracker.repoUrl,
      prEvent: "none",
      issueEvent: "none",
      trackNewContributor: false,
      trackNewFork: false,
      trackNewRelease: false,
      enableAiSummary: tracker.enableAiSummary,
    };

    // Parse PR events
    const prEvent = events.find(
      (e) =>
        e === PR_EVENTS.NEW_PR ||
        e === PR_EVENTS.PR_MERGED_TO_DEFAULT ||
        e.startsWith(PR_EVENTS.PR_MERGED_TO_BRANCH),
    );

    if (prEvent) {
      setShowPrSection(true);
      if (prEvent.includes(":")) {
        const [eventType, branch] = prEvent.split(":");
        formValues.prEvent =
          eventType as (typeof PR_EVENTS)[keyof typeof PR_EVENTS];
        formValues.prTargetBranch = branch;

        // check if branch still exists
        if (metadata && !metadata.branches.includes(branch!)) {
          setBranchWarning(
            `The branch "${branch}" is no longer available in ${metadata.fullName}. Please update your tracking configuration.`,
          );
          formValues.prEvent = "none";
          formValues.prTargetBranch = undefined;
        }
      } else {
        formValues.prEvent =
          prEvent as (typeof PR_EVENTS)[keyof typeof PR_EVENTS];
      }
    }

    const issueEvent = events.find(
      (e) =>
        e === ISSUE_EVENTS.NEW_ISSUE ||
        e.startsWith(ISSUE_EVENTS.NEW_ISSUE_WITH_TAG) ||
        e.startsWith(ISSUE_EVENTS.NEW_ISSUE_WITH_CUSTOM_TAG),
    );

    if (issueEvent) {
      setShowIssueSection(true);
      if (issueEvent.includes(":")) {
        const [eventType, tag] = issueEvent.split(":");
        formValues.issueEvent =
          eventType as (typeof ISSUE_EVENTS)[keyof typeof ISSUE_EVENTS];
        formValues.issueTag = tag;
      } else {
        formValues.issueEvent =
          issueEvent as (typeof ISSUE_EVENTS)[keyof typeof ISSUE_EVENTS];
      }
    }

    if (events.includes("new_contributor")) {
      setShowAdditionalSection(true);
      formValues.trackNewContributor = true;
    }
    if (events.includes("new_fork")) {
      setShowAdditionalSection(true);
      formValues.trackNewFork = true;
    }
    if (events.includes("new_release")) {
      setShowAdditionalSection(true);
      formValues.trackNewRelease = true;
    }

    configForm.reset(formValues as CreateTrackerInput);
  }, [tracker, metadata, configForm]);

  useEffect(() => {
    const subscription = configForm.watch(() => {
      setHasUnsavedChanges(true);
    });
    return () => subscription.unsubscribe();
  }, [configForm]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleConfigSubmit = async (data: CreateTrackerInput) => {
    await updateMutation.mutateAsync(data);
  };

  const handlePrToggle = (checked: boolean) => {
    setShowPrSection(checked);
    if (!checked) {
      configForm.setValue("prEvent", "none");
      configForm.setValue("prTargetBranch", undefined);
    }
  };

  const handleIssueToggle = (checked: boolean) => {
    setShowIssueSection(checked);
    if (!checked) {
      configForm.setValue("issueEvent", "none");
      configForm.setValue("issueTag", undefined);
    }
  };

  const handleAdditionalToggle = (checked: boolean) => {
    setShowAdditionalSection(checked);
    if (!checked) {
      configForm.setValue("trackNewContributor", false);
      configForm.setValue("trackNewFork", false);
      configForm.setValue("trackNewRelease", false);
    }
  };

  const handlePrEventChange = (
    value: (typeof PR_EVENTS)[keyof typeof PR_EVENTS],
  ) => {
    configForm.setValue("prEvent", value);
    if (value !== PR_EVENTS.PR_MERGED_TO_BRANCH) {
      configForm.setValue("prTargetBranch", undefined);
    }
  };

  const handleIssueEventChange = (
    value: (typeof ISSUE_EVENTS)[keyof typeof ISSUE_EVENTS],
  ) => {
    configForm.setValue("issueEvent", value);
    if (
      value !== ISSUE_EVENTS.NEW_ISSUE_WITH_TAG &&
      value !== ISSUE_EVENTS.NEW_ISSUE_WITH_CUSTOM_TAG
    ) {
      configForm.setValue("issueTag", undefined);
    }
  };

  const formValues = configForm.watch();

  const selectedEventsCount = useMemo(() => {
    let count = 0;
    if (formValues.prEvent !== "none") count++;
    if (formValues.issueEvent !== "none") count++;
    if (formValues.trackNewContributor) count++;
    if (formValues.trackNewFork) count++;
    if (formValues.trackNewRelease) count++;
    return count;
  }, [
    formValues.prEvent,
    formValues.issueEvent,
    formValues.trackNewContributor,
    formValues.trackNewFork,
    formValues.trackNewRelease,
  ]);

  const isMaxEventsReached = selectedEventsCount >= 4;
  const isFormValid = selectedEventsCount >= 1 && selectedEventsCount <= 4;

  const isPrSectionDisabled =
    isMaxEventsReached && formValues.prEvent === "none";
  const isIssueSectionDisabled =
    isMaxEventsReached && formValues.issueEvent === "none";

  const availableBranches =
    metadata?.branches.filter((branch) => branch !== metadata.defaultBranch) ??
    [];

  if (isLoadingTracker || isLoadingMetadata) {
    return (
      <Container className="flex flex-col gap-6">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-5">
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => {
                router.push("/track");
              }}
              disabled={updateMutation.isPending}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold">Manage Tracker</h1>
              <div className="flex items-center gap-2">
                <p className="text-muted-foreground text-sm">
                  Update tracking configuration for
                </p>
                <Skeleton className="h-4 w-[100px]" />
              </div>
            </div>
          </div>
        </div>
        <Skeleton className="h-8 w-64" />
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </Container>
    );
  }

  if (tracker?.id !== trackerId) {
    return (
      <Container className="flex flex-col gap-6">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-5">
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => {
                router.push("/track");
              }}
              disabled={updateMutation.isPending}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold">Manage Tracker</h1>
              <p className="text-muted-foreground text-sm">
                Update tracking configuration for {"<not-found>"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card flex items-center justify-between gap-9 rounded-lg border p-3">
          <div>
            <p className="text-sm font-medium">Tracker not found</p>
            <p className="text-muted-foreground text-sm">
              This tracker doesn&apos;t exist or you don&apos;t have access to
              it.
            </p>
          </div>
          <Button variant="secondary" size="smaller" asChild>
            <Link href="/track/new">
              <ChevronLeft />
              Back
            </Link>
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-5">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => {
              if (hasUnsavedChanges) {
                const confirmed = window.confirm(
                  "You have unsaved changes. Are you sure you want to leave?",
                );
                if (!confirmed) return;
              }
              router.push(`/track/${trackerId}`);
            }}
            disabled={updateMutation.isPending}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold">Manage Tracker</h1>
            <p className="text-muted-foreground text-sm">
              Update tracking configuration for {tracker.repoFullName}
            </p>
          </div>
        </div>
      </div>

      {branchWarning && (
        <Alert variant="destructive">
          <AlertTriangleIcon className="h-4 w-4" />
          <AlertTitle>Branch No Longer Available</AlertTitle>
          <AlertDescription>{branchWarning}</AlertDescription>
        </Alert>
      )}

      <Form {...configForm}>
        <form
          onSubmit={configForm.handleSubmit(handleConfigSubmit)}
          className="space-y-6"
        >
          <div className="bg-muted/50 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{tracker.repoFullName}</p>
                <p className="text-muted-foreground text-sm">
                  default branch: <span>{metadata?.defaultBranch}</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {metadata?.branches.length} branches
                </Badge>
                <Badge
                  variant={isFormValid ? "default" : "destructive"}
                  className="ml-2"
                >
                  {selectedEventsCount}/4 events
                </Badge>
              </div>
            </div>
          </div>

          <section className="bg-sidebar rounded-lg border">
            <div className="flex items-center justify-between px-5 pt-4 pb-3">
              <div>
                <h2 className="font-medium">Pull Requests</h2>
                <p className="text-muted-foreground text-sm">
                  Select a pull request event to track
                </p>
              </div>
              <Switch
                id="enable-pr"
                checked={showPrSection}
                onCheckedChange={handlePrToggle}
              />
            </div>
            <div
              className={`transition-all duration-200 ${
                showPrSection
                  ? "max-h-[600px] opacity-100"
                  : "max-h-0 overflow-hidden opacity-0"
              }`}
            >
              <Separator />
              <div className="px-5 py-4">
                <FormField
                  control={configForm.control}
                  name="prEvent"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <RadioGroup
                          value={field.value}
                          onValueChange={handlePrEventChange}
                          disabled={
                            updateMutation.isPending || isPrSectionDisabled
                          }
                        >
                          <div className="space-y-3">
                            <div
                              className={`flex items-center space-x-3 rounded-lg border p-3 transition-all duration-200 ${
                                isPrSectionDisabled
                                  ? "cursor-not-allowed opacity-50"
                                  : ""
                              }`}
                            >
                              <RadioGroupItem
                                value={PR_EVENTS.NEW_PR}
                                id="pr-new"
                                disabled={
                                  updateMutation.isPending ||
                                  isPrSectionDisabled
                                }
                              />
                              <Label
                                htmlFor="pr-new"
                                className={`flex-1 ${isPrSectionDisabled ? "cursor-not-allowed" : "cursor-pointer"}`}
                              >
                                <p className="font-medium">
                                  Track all new Pull Requests created
                                </p>
                              </Label>
                            </div>

                            <div
                              className={`flex items-center space-x-3 rounded-lg border p-3 transition-all duration-200 ${
                                isPrSectionDisabled
                                  ? "cursor-not-allowed opacity-50"
                                  : ""
                              }`}
                            >
                              <RadioGroupItem
                                value={PR_EVENTS.PR_MERGED_TO_DEFAULT}
                                id="pr-merged-default"
                                disabled={
                                  updateMutation.isPending ||
                                  isPrSectionDisabled
                                }
                              />
                              <Label
                                htmlFor="pr-merged-default"
                                className={`flex-1 ${isPrSectionDisabled ? "cursor-not-allowed" : "cursor-pointer"}`}
                              >
                                <p className="font-medium">
                                  Track all pull requests merged to default
                                  branch{" "}
                                  <span className="text-muted-foreground">
                                    (<code>{metadata?.defaultBranch}</code>)
                                  </span>
                                </p>
                              </Label>
                            </div>

                            <div
                              className={`flex items-center space-x-3 rounded-lg border p-3 text-sm transition-all duration-200 ${
                                isPrSectionDisabled ||
                                availableBranches.length === 0
                                  ? "cursor-not-allowed opacity-50"
                                  : ""
                              }`}
                            >
                              <RadioGroupItem
                                value={PR_EVENTS.PR_MERGED_TO_BRANCH}
                                id="pr-merged-branch"
                                disabled={
                                  updateMutation.isPending ||
                                  isPrSectionDisabled ||
                                  availableBranches.length === 0
                                }
                              />
                              <div className="flex items-center gap-2">
                                <p className="font-medium">
                                  Track all pull requests merged to
                                </p>
                                <FormField
                                  control={configForm.control}
                                  name="prTargetBranch"
                                  render={({ field: branchField }) => (
                                    <FormItem>
                                      <Select
                                        value={branchField.value ?? ""}
                                        onValueChange={(value) => {
                                          branchField.onChange(value);
                                          configForm.setValue(
                                            "prEvent",
                                            PR_EVENTS.PR_MERGED_TO_BRANCH,
                                          );
                                        }}
                                        disabled={
                                          updateMutation.isPending ||
                                          isPrSectionDisabled ||
                                          availableBranches.length === 0
                                        }
                                      >
                                        <FormControl>
                                          <SelectTrigger>
                                            <SelectValue placeholder="select branch" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          {availableBranches.map((branch) => (
                                            <SelectItem
                                              key={branch}
                                              value={branch}
                                            >
                                              {branch}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <p className="font-medium">branch.</p>
                              </div>
                            </div>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </section>

          <section className="bg-sidebar rounded-lg border">
            <div className="flex items-center justify-between px-5 pt-4 pb-3">
              <div>
                <h2 className="font-medium">Issues</h2>
                <p className="text-muted-foreground text-sm">
                  Select an issue event to track
                </p>
              </div>
              <Switch
                id="enable-issue"
                checked={showIssueSection}
                onCheckedChange={handleIssueToggle}
              />
            </div>
            <div
              className={`transition-all duration-200 ${
                showIssueSection
                  ? "max-h-[600px] opacity-100"
                  : "max-h-0 overflow-hidden opacity-0"
              }`}
            >
              <Separator />
              <div className="px-5 py-4">
                <FormField
                  control={configForm.control}
                  name="issueEvent"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <RadioGroup
                          value={field.value}
                          onValueChange={handleIssueEventChange}
                          disabled={
                            updateMutation.isPending || isIssueSectionDisabled
                          }
                        >
                          <div className="space-y-3">
                            <div
                              className={`flex items-center space-x-3 rounded-lg border p-3 transition-all duration-200 ${
                                isIssueSectionDisabled
                                  ? "cursor-not-allowed opacity-50"
                                  : ""
                              }`}
                            >
                              <RadioGroupItem
                                value={ISSUE_EVENTS.NEW_ISSUE}
                                id="issue-all"
                                disabled={
                                  updateMutation.isPending ||
                                  isIssueSectionDisabled
                                }
                              />
                              <Label
                                htmlFor="issue-all"
                                className={`flex-1 ${isIssueSectionDisabled ? "cursor-not-allowed" : "cursor-pointer"}`}
                              >
                                <p className="font-medium">
                                  Track all new issues created
                                </p>
                              </Label>
                            </div>

                            <div
                              className={`flex items-center space-x-3 rounded-lg border p-3 transition-all duration-200 ${
                                isIssueSectionDisabled
                                  ? "cursor-not-allowed opacity-50"
                                  : ""
                              }`}
                            >
                              <RadioGroupItem
                                value={ISSUE_EVENTS.NEW_ISSUE_WITH_TAG}
                                id="issue-tag"
                                disabled={
                                  updateMutation.isPending ||
                                  isIssueSectionDisabled
                                }
                              />
                              <div className="flex items-center gap-2">
                                <p className="font-medium">
                                  Track all new issues created with
                                </p>
                                <FormField
                                  control={configForm.control}
                                  name="issueTag"
                                  render={({ field: tagField }) => {
                                    const selectedLabel = GITHUB_LABELS.find(
                                      (label) => label.value === tagField.value,
                                    );

                                    return (
                                      <FormItem>
                                        <Select
                                          value={
                                            configForm.watch("issueEvent") ===
                                            ISSUE_EVENTS.NEW_ISSUE_WITH_TAG
                                              ? (tagField.value ?? "")
                                              : ""
                                          }
                                          onValueChange={(value) => {
                                            tagField.onChange(value);
                                            configForm.setValue(
                                              "issueEvent",
                                              ISSUE_EVENTS.NEW_ISSUE_WITH_TAG,
                                            );
                                          }}
                                          disabled={
                                            updateMutation.isPending ||
                                            isIssueSectionDisabled
                                          }
                                        >
                                          <FormControl>
                                            <SelectTrigger>
                                              <SelectValue placeholder="select tag">
                                                {selectedLabel
                                                  ? selectedLabel.label
                                                  : "select tag"}
                                              </SelectValue>
                                            </SelectTrigger>
                                          </FormControl>
                                          <SelectContent>
                                            {GITHUB_LABELS.map((label) => (
                                              <SelectItem
                                                key={label.value}
                                                value={label.value}
                                              >
                                                <div>
                                                  <div className="font-medium">
                                                    {label.label}
                                                  </div>
                                                  <div className="text-muted-foreground text-xs">
                                                    {label.description}
                                                  </div>
                                                </div>
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                        <FormMessage />
                                      </FormItem>
                                    );
                                  }}
                                />
                                <p className="font-medium">Tag.</p>
                              </div>
                            </div>

                            <div
                              className={`flex items-center space-x-3 rounded-lg border p-3 transition-all duration-200 ${
                                isIssueSectionDisabled
                                  ? "cursor-not-allowed opacity-50"
                                  : ""
                              }`}
                            >
                              <RadioGroupItem
                                value={ISSUE_EVENTS.NEW_ISSUE_WITH_CUSTOM_TAG}
                                id="issue-custom"
                                disabled={
                                  updateMutation.isPending ||
                                  isIssueSectionDisabled
                                }
                              />
                              <div className="flex items-center gap-2">
                                <p className="font-medium">
                                  Track all new issues created with
                                </p>
                                <FormField
                                  control={configForm.control}
                                  name="issueTag"
                                  render={({ field: tagField }) => (
                                    <FormItem>
                                      <FormControl>
                                        <Input
                                          placeholder="custom tag (e.g., priority-high)"
                                          value={
                                            configForm.watch("issueEvent") ===
                                            ISSUE_EVENTS.NEW_ISSUE_WITH_CUSTOM_TAG
                                              ? (tagField.value ?? "")
                                              : ""
                                          }
                                          onChange={(e) => {
                                            const value = e.target.value;
                                            tagField.onChange(value);
                                            if (value.trim()) {
                                              configForm.setValue(
                                                "issueEvent",
                                                ISSUE_EVENTS.NEW_ISSUE_WITH_CUSTOM_TAG,
                                              );
                                            }
                                          }}
                                          disabled={
                                            updateMutation.isPending ||
                                            isIssueSectionDisabled
                                          }
                                          className="w-[300px]"
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <p className="font-medium">Tag.</p>
                              </div>
                            </div>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </section>

          <section className="bg-sidebar rounded-lg border">
            <div className="flex items-center justify-between px-5 pt-4 pb-3">
              <div>
                <h2 className="font-medium">Additional Options</h2>
                <p className="text-muted-foreground text-sm">
                  Additional events to track
                </p>
              </div>
              <Switch
                id="enable-additional"
                checked={showAdditionalSection}
                onCheckedChange={handleAdditionalToggle}
              />
            </div>
            <div
              className={`transition-all duration-200 ${
                showAdditionalSection
                  ? "max-h-[400px] opacity-100"
                  : "max-h-0 overflow-hidden opacity-0"
              }`}
            >
              <Separator />
              <div className="grid grid-cols-2 gap-4 px-5 py-4">
                <FormField
                  control={configForm.control}
                  name="trackNewContributor"
                  render={({ field }) => (
                    <FormItem
                      className={`flex items-start space-y-0 space-x-2 rounded-lg border p-3 transition-all duration-200 ${
                        isMaxEventsReached && !field.value
                          ? "cursor-not-allowed opacity-50"
                          : ""
                      }`}
                    >
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={
                            updateMutation.isPending ||
                            (isMaxEventsReached && !field.value)
                          }
                          className="mt-px"
                        />
                      </FormControl>
                      <div className="flex-col justify-start text-left leading-none">
                        <FormLabel
                          className={`flex ${isMaxEventsReached && !field.value ? "cursor-not-allowed" : "cursor-pointer"}`}
                        >
                          <p className="font-medium">Track new Contributors</p>
                        </FormLabel>
                        <p className="text-muted-foreground mt-1 text-sm">
                          Get notified when a new contributor is added
                        </p>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={configForm.control}
                  name="trackNewFork"
                  render={({ field }) => (
                    <FormItem
                      className={`flex items-start space-y-0 space-x-2 rounded-lg border p-3 transition-all duration-200 ${
                        isMaxEventsReached && !field.value
                          ? "cursor-not-allowed opacity-50"
                          : ""
                      }`}
                    >
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={
                            updateMutation.isPending ||
                            (isMaxEventsReached && !field.value)
                          }
                          className="mt-px"
                        />
                      </FormControl>
                      <div className="flex-col justify-start text-left leading-none">
                        <FormLabel
                          className={`flex ${isMaxEventsReached && !field.value ? "cursor-not-allowed" : "cursor-pointer"}`}
                        >
                          <p className="font-medium">Track new Forks</p>
                        </FormLabel>
                        <p className="text-muted-foreground mt-1 text-sm">
                          Get notified when a fork is created
                        </p>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={configForm.control}
                  name="trackNewRelease"
                  render={({ field }) => (
                    <FormItem
                      className={`flex items-start space-y-0 space-x-2 rounded-lg border p-3 transition-all duration-200 ${
                        isMaxEventsReached && !field.value
                          ? "cursor-not-allowed opacity-50"
                          : ""
                      }`}
                    >
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={
                            updateMutation.isPending ||
                            (isMaxEventsReached && !field.value)
                          }
                          className="mt-px"
                        />
                      </FormControl>
                      <div className="flex-col justify-start text-left leading-none">
                        <FormLabel
                          className={`flex ${isMaxEventsReached && !field.value ? "cursor-not-allowed" : "cursor-pointer"}`}
                        >
                          <p className="font-medium">Track new releases</p>
                        </FormLabel>
                        <p className="text-muted-foreground mt-1 text-sm">
                          Get notified when a new version is released
                        </p>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </section>

          <section className="bg-sidebar rounded-lg border">
            <div className="px-5 pt-4 pb-3">
              <h2 className="font-medium">AI Summaries</h2>
            </div>
            <Separator />
            <div className="px-5 py-4">
              <FormField
                control={configForm.control}
                name="enableAiSummary"
                render={({ field }) => (
                  <FormItem className="flex items-start space-y-0 space-x-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={updateMutation.isPending}
                      />
                    </FormControl>
                    <div className="flex-1">
                      <FormLabel className="cursor-pointer">
                        Enable AI summaries
                      </FormLabel>
                      <FormDescription className="mt-1">
                        Get AI-generated summaries of repository activity
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </section>

          {!isFormValid && selectedEventsCount > 0 && (
            <div className="border-destructive/20 bg-destructive/10 rounded-lg border p-4">
              <p className="text-destructive text-sm font-medium">
                You can select a maximum of 4 events. Please deselect{" "}
                {selectedEventsCount - 4} event(s).
              </p>
            </div>
          )}

          {selectedEventsCount === 0 && (
            <div className="bg-muted rounded-lg border p-4">
              <p className="text-muted-foreground text-sm font-medium">
                Please enable at least one tracking option to continue.
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                if (hasUnsavedChanges) {
                  const confirmed = window.confirm(
                    "You have unsaved changes. Are you sure you want to cancel?",
                  );
                  if (!confirmed) return;
                }
                router.push(`/track/${trackerId}`);
              }}
              disabled={updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={
                updateMutation.isPending || !isFormValid || !hasUnsavedChanges
              }
              loading={updateMutation.isPending}
            >
              {hasUnsavedChanges ? "Save Changes (unsaved)" : "Save Changes"}
            </Button>
          </div>
        </form>
      </Form>
    </Container>
  );
};

export default ManageTracker;
