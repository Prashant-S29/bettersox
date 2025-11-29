export const normalizeGitHubUrl = ({ url }: { url: string }) => {
  url = url.trim();

  if (url.startsWith("git@github.com:")) {
    url = url
      .replace("git@github.com:", "https://github.com/")
      .replace(/\.git$/, "");
    return url;
  }

  if (url.endsWith(".git")) {
    url = url.replace(/\.git$/, "");
  }

  if (!url.startsWith("https://")) {
    if (url.startsWith("http://")) {
      url = url.replace("http://", "https://");
    } else if (url.startsWith("github.com")) {
      url = "https://" + url;
    }
  }

  url = url.replace(/\/+$/, "");

  return url;
};
