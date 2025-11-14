import React from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  StarIcon,
  GitForkIcon,
  CircleDotIcon,
  ExternalLinkIcon,
  GitPullRequestIcon,
} from "lucide-react";
import type { GitHubRepository } from "~/lib/github/client";

interface RepositoryCardProps {
  repository: GitHubRepository;
}

export const RepositoryCard: React.FC<RepositoryCardProps> = ({
  repository,
}) => {
  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 1) return "today";
    if (diffDays === 1) return "yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  return (
    <div className="border-border bg-card hover:border-primary rounded-lg border p-6 transition-all hover:shadow-md">
      {/* Header */}
      <div className="mb-3 flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <img
              src={repository.owner.avatarUrl}
              alt={repository.owner.login}
              className="h-6 w-6 rounded-full"
            />

            <a
              href={repository.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary text-lg font-semibold hover:underline"
            >
              {repository.nameWithOwner}
            </a>
            <ExternalLinkIcon className="text-muted-foreground h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Description */}
      {repository.description && (
        <p className="text-muted-foreground mb-4 line-clamp-2 text-sm">
          {repository.description}
        </p>
      )}

      {/* Stats */}
      <div className="text-muted-foreground mb-4 flex flex-wrap items-center gap-4 text-sm">
        {repository.primaryLanguage && (
          <div className="flex items-center gap-1.5">
            <CircleDotIcon
              className="h-3 w-3"
              style={{ color: repository.primaryLanguage.color }}
            />
            <span>{repository.primaryLanguage.name}</span>
          </div>
        )}

        <div className="flex items-center gap-1.5">
          <StarIcon className="h-4 w-4" />
          <span>{formatNumber(repository.stargazerCount)}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <GitForkIcon className="h-4 w-4" />
          <span>{formatNumber(repository.forkCount)}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <GitPullRequestIcon className="h-4 w-4" />
          <span>{repository.openIssuesCount} open issues</span>
        </div>

        <span>Updated {formatDate(repository.pushedAt)}</span>
      </div>

      {/* Topics */}
      {repository.topics.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {repository.topics.slice(0, 5).map((topic) => (
            <Badge key={topic} variant="secondary" className="text-xs">
              {topic}
            </Badge>
          ))}
          {repository.topics.length > 5 && (
            <Badge variant="secondary" className="text-xs">
              +{repository.topics.length - 5} more
            </Badge>
          )}
        </div>
      )}

      {/* Badges */}
      <div className="flex flex-wrap gap-2">
        {repository.hasGoodFirstIssues && (
          <Badge variant="outline" className="border-green-500 text-green-700">
            Good First Issues
          </Badge>
        )}
        {repository.hasHelpWantedIssues && (
          <Badge variant="outline" className="border-blue-500 text-blue-700">
            Help Wanted
          </Badge>
        )}
        {repository.hasContributingFile && (
          <Badge
            variant="outline"
            className="border-purple-500 text-purple-700"
          >
            Contributing Guide
          </Badge>
        )}
        {repository.hasCodeOfConduct && (
          <Badge
            variant="outline"
            className="border-orange-500 text-orange-700"
          >
            Code of Conduct
          </Badge>
        )}
        {repository.licenseInfo && (
          <Badge variant="outline">{repository.licenseInfo.name}</Badge>
        )}
      </div>

      {/* Actions */}
      <div className="mt-4 flex gap-2">
        <Button asChild variant="default" size="sm">
          <a href={repository.url} target="_blank" rel="noopener noreferrer">
            View Repository
          </a>
        </Button>
        <Button asChild variant="outline" size="sm">
          <a
            href={`${repository.url}/issues?q=is:issue+is:open+label:"good+first+issue"`}
            target="_blank"
            rel="noopener noreferrer"
          >
            View Issues
          </a>
        </Button>
      </div>
    </div>
  );
};
