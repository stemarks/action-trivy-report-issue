import * as process from "process";
import * as fs from "fs/promises";

import { generateIssues, parseResults } from "./report-generator.js";
import { IssueOption, ReportDict } from "./interface.js";
import { GitHub } from "./github.js";
import { Inputs } from "./inputs.js";

function abort(message: string, error?: Error): never {
  console.error(`Error: ${message}`);
  if (error) {
    console.error(error); // Optionally log the error object itself
  }
  process.exit(1);
}

async function main() {

  // Read inputs from environment variables
  const inputs = new Inputs();

  // Initialize GitHub client with the provided token
  const github = new GitHub(inputs.token);

  try {
    // Create GitHub labels if createLabels is true and the labels dont already exist
    // TODO: move this to  create or update issue function in github
    if (inputs.issue.createLabels) {
      for (let i = 0; i < inputs.issue.labels.length; i++) {
        await github.createLabelIfMissing(inputs.issue.labels[i]);
      }
    }

    // Read Trivy report from file and parse it into a ReportDict object
    const trivyRaw = await fs.readFile(inputs.issue.filename, "utf-8");
    const reportData = JSON.parse(trivyRaw) as ReportDict; // Data is now defined here.

    // Fetch existing Trivy issues from GitHub and filter out duplicates using a Set
    const existingIssues = await github.getTrivyIssues(
      inputs.issue.labels
    );

    const reports = parseResults(reportData, existingIssues);

    if (reports === null && existingIssues !== null) {
      console.log("No reports found but open issues were found")
      // TODO: have an input to closes issues that are no longer in the report
      return;
    } else if (reports === null) {
      console.log("No reports to create issues for");
      return;
    }

    // Generate GitHub issues from the parsed report data
    const issues = generateIssues(reports);

    // Create GitHub issues from the parsed report data, excluding duplicates if found in existing issues
    for (const issue of issues) {
      //check if issue exists
      const existingIssue = existingIssues.find(existingIssue => existingIssue.title.toLowerCase() === issue.title.toLowerCase());
      if (existingIssue) {
        // Issue exists, check if we need to update it (e.g., if a fix is now available)
        if (issue.hasFix && !existingIssue.labels.includes(inputs.issue.fixLabel!) ||
          issue.body !== existingIssue.body) {
          // Update the issue
          const updateIssueOption: IssueOption & { hasFix?: boolean } = {
            title: issue.title,
            body: issue.body,
            labels: inputs.issue.labels, // Use the labels from inputs
            assignees: inputs.issue.assignees,
            projectId: inputs.issue.projectId,
            enableFixLabel: inputs.issue.enableFixLabel,
            fixLabel: inputs.issue.fixLabel,
            hasFix: issue.hasFix,
          };
          await github.updateIssue(existingIssue.number, updateIssueOption);
        }
      } else {
        // Issue doesn't exist, create it
        const issueOption = { title: issue.title, body: issue.body, ...inputs.issue, hasFix: issue.hasFix };
        await github.createIssue(
          issueOption
        );
      }
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
