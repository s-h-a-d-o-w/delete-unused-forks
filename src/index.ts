import confirm from "@inquirer/confirm";
import { Octokit } from "octokit";
import dotenv from "dotenv";

dotenv.config();

const USERNAME = process.env.GITHUB_USERNAME as string;
const TOKEN = process.env.GITHUB_TOKEN as string;

const octokit = new Octokit({ auth: TOKEN });

async function fetchForks() {
  console.log("Fetching list of forks...");
  let page = 1;
  let forks: Awaited<
    ReturnType<typeof octokit.rest.repos.listForAuthenticatedUser>
  >["data"] = [];

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { data, headers } = await octokit.rest.repos.listForAuthenticatedUser(
      {
        affiliation: "owner",
        page,
        per_page: 100,
      },
    );

    forks = forks.concat(data.filter((repo) => repo.fork));

    if (data.length === 0 || !headers.link || !headers.link.includes("next")) {
      break;
    }
    page++;
  }

  return forks;
}

async function getPRCountForFork(name: string) {
  console.log(`Fetching PR info for ${name}...`);
  const parentName = (
    await octokit.rest.repos.get({
      owner: USERNAME,
      repo: name,
    })
  ).data.parent?.full_name;

  if (!parentName) {
    console.log("Couldn't find parent repo for " + name);
    return;
  }

  const response = await octokit.rest.search.issuesAndPullRequests({
    q: `is:pr repo:${parentName} author:${USERNAME}`,
  });

  return response.data.total_count;
}

async function confirmAndDelete(name: string) {
  const shouldDelete = await confirm({
    message: `Do you want to delete ${name}? ( https://github.com/${USERNAME}/${name} )`,
    default: false,
  });

  if (shouldDelete) {
    try {
      await octokit.rest.repos.delete({
        owner: USERNAME,
        repo: name,
      });
      console.log(`Deleted ${USERNAME}/${name}.`);
    } catch (error) {
      console.error(`Failed to delete ${USERNAME}/${name}.`, error);
    }
  } else {
    console.log(`Kept ${USERNAME}/${name}.`);
  }
}

async function main() {
  if (!USERNAME || !TOKEN) {
    console.log("USERNAME or TOKEN missing!");
    return;
  }

  try {
    const forks = await fetchForks();
    console.log(`Found ${forks.length}.`);

    for (const fork of forks) {
      const prCount = await getPRCountForFork(fork.name);
      if (prCount === 0) {
        console.log(`No PRs found.`);
        await confirmAndDelete(fork.name);
      } else if (prCount && prCount > 0) {
        console.log(`${prCount} PR${prCount === 1 ? "" : "s"} found.`);
      }
    }
  } catch (error) {
    console.error("Failed to fetch data:", error);
  }
}

main();
