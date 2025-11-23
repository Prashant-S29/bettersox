"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";

// zod and rfh
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

// schema and types
import {
  verifyRepoSchema,
  createTrackerSchema,
  type VerifyRepoInput,
  type CreateTrackerInput,
} from "~/schema/zod.schema.tracker";
import {
  PR_EVENTS,
  ISSUE_EVENTS,
  GITHUB_LABELS,
  type RepoMetadata,
} from "~/types/types.tracker";

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

// icons
import { ChevronLeft, Loader2Icon } from "lucide-react";

// lib
import { formatDate } from "~/lib/utils/date-parser";

const NewTracker: React.FC = () => {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [repoMetadata, setRepoMetadata] = useState<RepoMetadata | null>(null);

  const [showPrSection, setShowPrSection] = useState(false);
  const [showIssueSection, setShowIssueSection] = useState(false);
  const [showAdditionalSection, setShowAdditionalSection] = useState(false);

  const { data: trackerData, isLoading } =
    api.tracker.getTrackerMetadata.useQuery();

  const verifyForm = useForm<VerifyRepoInput>({
    resolver: zodResolver(verifyRepoSchema),
    defaultValues: {
      repoUrl: "",
    },
  });

  // step 2 form
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

  const verifyMutation = api.tracker.verifyRepo.useQuery(
    { repoUrl: verifyForm.watch("repoUrl") },
    { enabled: false },
  );

  const createTrackerMutation = api.tracker.create.useMutation({
    onSuccess: (result) => {
      if (result.error) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      router.push("/track");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleVerifyRepo = async (data: VerifyRepoInput) => {
    const result = await verifyMutation.refetch();

    if (result.data?.error || !result.data?.data) {
      toast.error(result.data?.message ?? "failed to verify repository");
      return;
    }

    setRepoMetadata(result.data.data);
    configForm.setValue("repoUrl", data.repoUrl);
    setStep(2);
    toast.success("repository verified successfully");
  };

  const handleConfigSubmit = async (data: CreateTrackerInput) => {
    await createTrackerMutation.mutateAsync(data);
  };

  const handleBack = () => {
    setStep(1);
    configForm.reset();

    setRepoMetadata(null);
    setShowPrSection(false);
    setShowIssueSection(false);
    setShowAdditionalSection(false);
  };

  const availableBranches =
    repoMetadata?.branches.filter(
      (branch) => branch !== repoMetadata.defaultBranch,
    ) ?? [];

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

  if (isLoading) {
    return (
      <Container className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">Verify Repository</h1>
            <p className="text-muted-foreground text-sm">
              Enter the github repository url you want to track
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2 rounded-lg border p-2">
          <Skeleton className="h-6 w-full max-w-[300px]" />
          <div className="flex flex-col gap-1">
            <Skeleton className="h-3 w-full max-w-[500px]" />
            <Skeleton className="h-3 w-full max-w-[500px]" />
            <Skeleton className="h-3 w-full max-w-[500px]" />
          </div>
        </div>
      </Container>
    );
  }

  if (trackerData?.data?.id) {
    return (
      <Container className="flex flex-col gap-6">
        <div>
          <h1 className="text-lg font-semibold">Verify Repository</h1>
          <p className="text-muted-foreground text-sm">
            Enter the github repository url you want to track
          </p>
        </div>
        <div className="flex flex-col gap-5">
          <div className="bg-card flex items-center justify-between gap-9 rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">You have an active tracker</p>
              <p className="text-muted-foreground text-sm">
                You can only track one repo at a time. To create a new tracker,
                delete the existing one.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2">
            <div className="bg-card group flex flex-col gap-1 rounded-lg border p-3">
              <div className="flex w-full items-center justify-between">
                <Link
                  href={`/track/${trackerData.data.id}`}
                  className="font-semibold underline-offset-2 group-hover:underline"
                >
                  {trackerData.data.repoFullName}
                </Link>

                <Badge variant="outline" className="gap-2">
                  <span className="bg-primary size-2 rounded-full" />
                  Active
                </Badge>
              </div>

              <div className="text-muted-foreground text-sm">
                <p>
                  Create at: {formatDate(trackerData.data.createdAt.toString())}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex flex-col gap-5">
            {step === 2 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleBack}
                disabled={createTrackerMutation.isPending}
                className="w-fit"
              >
                <ChevronLeft className="h-4 w-4" />
                Setup
              </Button>
            )}
            <h1 className="text-lg font-semibold">
              {step === 1 ? "Verify Repository" : "Configure Tracking"}
            </h1>
          </div>
          <p className="text-muted-foreground text-sm">
            {step === 1
              ? "Enter the github repository url you want to track"
              : `Setting up tracker for ${repoMetadata?.fullName}`}
          </p>
        </div>
      </div>

      {step === 1 && (
        <Form {...verifyForm}>
          <form
            onSubmit={verifyForm.handleSubmit(handleVerifyRepo)}
            className="space-y-6"
          >
            <section className="bg-sidebar rounded-lg border">
              <div className="px-5 pt-4 pb-3">
                <h2 className="font-medium">Repository URL</h2>
                <p className="text-muted-foreground text-sm">
                  Must be a public github repository
                </p>
              </div>
              <Separator />
              <div className="px-5 py-5">
                <FormField
                  control={verifyForm.control}
                  name="repoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="https://github.com/facebook/react"
                          {...field}
                          disabled={verifyMutation.isFetching}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex justify-end gap-3 px-5 pb-5">
                <Button
                  type="button"
                  variant="outline"
                  size="smaller"
                  onClick={() => router.push("/track")}
                  disabled={verifyMutation.isFetching}
                  className="h-7.5"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="smaller"
                  disabled={verifyMutation.isFetching}
                >
                  {verifyMutation.isFetching && (
                    <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Verify and Continue
                </Button>
              </div>
            </section>
          </form>
        </Form>
      )}

      {step === 2 && repoMetadata && (
        <Form {...configForm}>
          <form
            onSubmit={configForm.handleSubmit(handleConfigSubmit)}
            className="space-y-6"
          >
            <div className="bg-muted/50 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{repoMetadata.fullName}</p>
                  <p className="text-muted-foreground text-sm">
                    default branch: <span>{repoMetadata.defaultBranch}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {repoMetadata.branches.length} branches
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
                              createTrackerMutation.isPending ||
                              isPrSectionDisabled
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
                                    createTrackerMutation.isPending ||
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
                                    createTrackerMutation.isPending ||
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
                                      (<code>{repoMetadata.defaultBranch}</code>
                                      )
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
                                    createTrackerMutation.isPending ||
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
                                            createTrackerMutation.isPending ||
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
                              createTrackerMutation.isPending ||
                              isIssueSectionDisabled
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
                                    createTrackerMutation.isPending ||
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
                                    createTrackerMutation.isPending ||
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
                                        (label) =>
                                          label.value === tagField.value,
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
                                              createTrackerMutation.isPending ||
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
                                    createTrackerMutation.isPending ||
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
                                              createTrackerMutation.isPending ||
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
                              createTrackerMutation.isPending ||
                              (isMaxEventsReached && !field.value)
                            }
                            className="mt-px"
                          />
                        </FormControl>
                        <div className="flex-col justify-start text-left leading-none">
                          <FormLabel
                            className={`flex ${isMaxEventsReached && !field.value ? "cursor-not-allowed" : "cursor-pointer"}`}
                          >
                            <p className="font-medium">
                              Track new Contributors
                            </p>
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
                              createTrackerMutation.isPending ||
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
                              createTrackerMutation.isPending ||
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
                          disabled={createTrackerMutation.isPending}
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
              <div className="bg-destructive/10 border-destructive/20 rounded-lg border p-4">
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
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleBack}
                  disabled={createTrackerMutation.isPending}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={createTrackerMutation.isPending || !isFormValid}
                  loading={createTrackerMutation.isPending}
                  onClick={configForm.handleSubmit(handleConfigSubmit)}
                >
                  Start Tracking
                </Button>
              </div>
            </div>
          </form>
        </Form>
      )}
    </Container>
  );
};

export default NewTracker;
