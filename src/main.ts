import * as process from "process";
import * as fs from "fs/promises";

import { generateIssues, parseResults } from "./report-generator.js";
import { ReportDict } from "./interface.js";
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

  const inputs = new Inputs();

  const github = new GitHub(inputs.token);

  try {
    if (inputs.issue.createLabels) {
      for (let i = 0; i < inputs.issue.labels.length; i++) {
        await github.createLabelIfMissing(inputs.issue.labels[i]);
      }
    }

    const fileContent = await fs.readFile(inputs.issue.filename, "utf-8");
    const data = JSON.parse(fileContent) as ReportDict; // Data is now defined here.

    const existingIssues = await github.getTrivyIssues(
      inputs.issue.labels
    );
    const reports = parseResults(data, existingIssues);

    if (reports === null) {
      console.log("No reports to create issues for");
      return;
    }

    const issues = generateIssues(reports);
    for (const issue of issues) {
      const issueOption = { title: issue.title, body: issue.body, ...inputs.issue };
      await github.createIssue(
        issueOption
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
