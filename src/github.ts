import * as github from '@actions/github';
import { Octokit } from '@octokit/rest';
import { IssueOption, IssueResponse, TrivyIssue } from './interface.js';
import { RequestError } from '@octokit/request-error';
import { Issue } from './dataclass.js';


export class GitHub {
    client: Octokit;

    constructor(token: string) {
        this.client = new Octokit({ auth: token });
    }

    async getTrivyIssues(labels: string[] | undefined): Promise<TrivyIssue[]> {
        try {
            if (!labels) {
                return [];
            }

            let { data: trivyIssues } = await this.client.issues.listForRepo({
                ...github.context.repo,
                labels: labels.join(','),
                state: 'all',
            });

            return trivyIssues
                .filter(issue => issue.title && issue.body)
                .map(issue => ({
                    number: issue.number,
                    title: issue.title,
                    body: issue.body!,
                    state: issue.state,
                    labels: issue.labels.map(label =>
                        typeof label === 'string' ? label : (label.name ?? '')
                    ).filter(Boolean),
                    html_url: issue.html_url ?? ''
                }));
        } catch (err) {
            throw new Error(`Failed to fetch issues: ${err}`);
        }
    }

    async createIssue(options: IssueOption): Promise<IssueResponse> {
        try {
            const { data: issue } = await this.client.issues.create({
                ...github.context.repo,
                ...options,
            });
            return { issueNumber: issue.number, htmlUrl: issue.html_url };
        }
        catch (err) {
            throw new Error(`Failed to create issue: ${err}`);
        }
    }
    async updateIssue(issueNumber: number, options: Issue): Promise<void> {
        try {
            await this.client.issues.update({
                ...github.context.repo,
                issue_number: issueNumber,
                ...options,
            });
        } catch (err) {
            throw new Error(`Failed to update issue: ${err}`);
        }
    }

    async createLabelIfMissing(
        label: string,
    ): Promise<void> {
        try {
            await this.client.issues.getLabel({
                ...github.context.repo,
                name: label,
            });
            console.log(`Label "${label}" already exists.`);
        } catch (error: unknown) {
            if (error instanceof RequestError) {
                // Use RequestError (or the appropriate Octokit error type)
                if (error.status === 404) {
                    console.log(`Label "${label}" does not exist. Creating it...`);
                    await this.client.issues.createLabel({
                        ...github.context.repo,
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

}