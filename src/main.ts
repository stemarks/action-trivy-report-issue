import * as process from "process";
import * as fs from "fs/promises";
import * as argparse from "argparse";

import { Octokit } from "@octokit/rest";
import { Issue } from "./dataclass.js";
import { generateIssues, parseResults } from "./report-generator.js";
import { ReportDict } from "./interfaces.js";
import { RequestError } from "@octokit/request-error"; // Import the specific error type

// ... (interfaces and types)

async function fetchExistingIssues(
  octokit: Octokit,
  owner: string,
  repo: string,
  label: string,
): Promise<string[]> {
  try {
    const response = await octokit.issues.listForRepo({
      owner,
      repo,
      labels: label,
      state: "all",
    });

    return response.data.map((issue) => issue.title);
  } catch (error) {
    throw new Error(`Failed to fetch issues: ${error}`);
  }
}

async function createGitHubIssue(
  octokit: Octokit,
  owner: string,
  repo: string,
  issue: Issue,
  label: string,
  assignees: string[],
): Promise<void> {
  try {
    await octokit.issues.create({
      owner,
      repo,
      title: issue.title,
      body: issue.body,
      labels: [label],
      assignees: assignees,
    });
    console.log(`Created GitHub issue: ${issue.title}`);
  } catch (error) {
    throw new Error(`Failed to create issue: ${error}`);
  }
}

async function createLabelIfMissing(
  octokit: Octokit,
  owner: string,
  repo: string,
  label: string,
): Promise<void> {
  try {
    await octokit.rest.issues.getLabel({
      owner: owner,
      repo: repo,
      name: label,
    });
    console.log(`Label "${label}" already exists.`);
  } catch (error: unknown) {
    if (error instanceof RequestError) {
      // Use RequestError (or the appropriate Octokit error type)
      if (error.status === 404) {
        console.log(`Label "${label}" does not exist. Creating it...`);
        await octokit.rest.issues.createLabel({
          owner: owner,
          repo: repo,
          name: label,
        });
        console.log(`Label "${label}" created successfully.`);
      } else {
        throw new Error(
          `Error checking or creating label "${label}": ${error.message}`,
        );
      }
    } else if (error instanceof Error) {
      // Handle other standard JavaScript errors
      throw new Error(
        `Error checking or creating label "${label}": ${error.message}`,
      );
    } else {
      // Handle cases where error is not an Error instance
      throw new Error(
        `Error checking or creating label "${label}": An unknown error occurred.`,
      );
    }
  }
}

function abort(message: string, error?: Error): never {
  console.error(`Error: ${message}`);
  if (error) {
    console.error(error); // Optionally log the error object itself
  }
  process.exit(1);
}

async function main() {
  const parser = new argparse.ArgumentParser({
    description:
      "Parses Trivy JSON report files and reports new vulnerabilities as GitHub issues. Existing issues are read from the repository $GITHUB_REPOSITORY and used to exclude reported issues.",
  });
  parser.add_argument("file");
  const args = parser.parse_args();
  const filename: string = args.file;
  // GitHub Action inputs are accessed via process.env
  const githubRepo = process.env.GITHUB_REPOSITORY;
  const githubToken = process.env.INPUT_TOKEN; // Corrected: INPUT_token
  const inputLabel = process.env.INPUT_LABEL;
  const assignee = process.env.INPUT_ASSIGNEE;
  const createLabel = process.env.INPUT_CREATE_LABEL === "true"; // Convert to boolean

  if (!githubRepo || !githubToken || !inputLabel) {
    abort(
      "Environment variables GITHUB_REPOSITORY, GITHUB_TOKEN, and INPUT_LABEL must be set.",
    );
    return;
  }

  const [owner, repo] = githubRepo.split("/");
  if (!owner || !repo) {
    abort("Invalid GITHUB_REPOSITORY format. Expected 'owner/repo'.");
    return;
  }

  // Add validation for TOKEN (example: check length or prefix)
  if (githubToken.length < 4) {
    abort("Invalid GITHUB_TOKEN format. Token is too short.");
    return;
  }

  // Example: Check if INPUT_CREATE_LABEL is a valid boolean string
  if (
    process.env.INPUT_CREATE_LABEL &&
    !["true", "false"].includes(process.env.INPUT_CREATE_LABEL.toLowerCase())
  ) {
    abort("Invalid INPUT_CREATE_LABEL value.  Must be 'true' or 'false'.");
    return;
  }

  const octokit = new Octokit({ auth: githubToken });
  const assignees = assignee ? [assignee] : [];

  try {
    if (createLabel) {
      await createLabelIfMissing(octokit, owner, repo, inputLabel);
    }

    const fileContent = await fs.readFile(filename, "utf-8");
    const data = JSON.parse(fileContent) as ReportDict; // Data is now defined here.

    const existingIssues = await fetchExistingIssues(
      octokit,
      owner,
      repo,
      inputLabel,
    );
    const reports = parseResults(data, existingIssues);

    if (reports === null) {
      console.log("No reports to create issues for");
      return;
    }

    const issues = generateIssues(reports);
    for (const issue of issues) {
      await createGitHubIssue(
        octokit,
        owner,
        repo,
        issue,
        inputLabel,
        assignees,
      );
    }
  } catch (error) {
    if (error instanceof Error) {
      abort(`Error: ${error.message}`, error);
    } else {
      abort(`Error: An unknown error occurred. ${error}`);
    }
  }
}

main();
