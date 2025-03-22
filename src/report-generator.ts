import { Issue, Report } from "./dataclass.js";
import { ReportDict, TrivyIssue } from "./interface.js";

export function parseResults(
    data: ReportDict,
    existing_issues: TrivyIssue[],
): Report[] | null {
    /**
     * Parses Trivy result structure and creates a report per package/version that
     * was found. Return null if no Results found, ie. nothing to parse.
     *
     * @param data The report data that was parsed from JSON file.
     * @param existing_issues List of GitHub issues, used to exclude already reported issues.
     */
    try {
        const results = data.Results;

        if (!Array.isArray(results)) {
            throw new TypeError(
                `The JSON entry .Results is not a list, got: ${typeof results}`,
            );
        }

        const reports: { [key: string]: Report } = {};

        // Create a Set of existing issue identifiers for efficient lookup
        const existingIssueSet = new Set<string>();
        for (const issue of existing_issues) {
            existingIssueSet.add(issue.title.toLowerCase()); // Normalize here
        }

        for (let idx = 0; idx < results.length; idx++) {
            const result = results[idx];

            if (
                typeof result !== "object" ||
                result === null ||
                Array.isArray(result)
            ) {
                throw new TypeError(
                    `The JSON entry .Results[${idx}] is not a dictionary, got: ${typeof result}`,
                );
            }

            if (!("Vulnerabilities" in result)) {
                continue;
            }

            const package_type = result["Type"];
            const vulnerabilities = result["Vulnerabilities"];

            if (!Array.isArray(vulnerabilities)) {
                throw new TypeError(
                    `The JSON entry .Results[${idx}].Vulnerabilities is not a list, got: ${typeof vulnerabilities}`,
                );
            }

            for (const vulnerability of vulnerabilities) {
                const package_name = vulnerability["PkgName"];
                const package_version = vulnerability["InstalledVersion"];
                const package_fixed_version = vulnerability["FixedVersion"];
                const pkg = `${package_name}-${package_version}`;
                const report_id = `${pkg}`;
                const issueIdentifier = `${package_name.toLowerCase()} ${package_version.toLowerCase()}`; // Normalize here

                if (existingIssueSet.has(issueIdentifier)) {
                    continue;
                }

                const lookup_id = `${package_type}:${report_id}`;

                let report = reports[lookup_id];
                if (!report) {
                    report = {
                        id: report_id,
                        package: pkg,
                        package_name: package_name,
                        package_version: package_version,
                        package_fixed_version: package_fixed_version,
                        package_type: package_type,
                        target: result["Target"],
                        vulnerabilities: [vulnerability],
                    };
                    reports[lookup_id] = report;
                } else {
                    report.vulnerabilities.push(vulnerability);
                }
            }
        }

        return Object.values(reports);
    } catch (e) {
        console.error("Error during parse_results:", e);

        return null;
    }
}

export function generateIssues(reports: Report[]): Issue[] {
    /**
     * Iterates all reports and renders them into GitHub issues.
     */
    const issues: Issue[] = [];
    for (const report of reports) {
        const issue_title = `Security Alert: ${report.package_type} package ${report.package}`;

        let issue_body = `# Vulnerabilities found for ${report.package_type} package \`${report.package}\` in \`${report.target}\`\n\n`;
        issue_body += `## Fixed in version\n**${report.package_fixed_version || "No known fix at this time"
            }**\n\n`;

        for (
            let vulnerability_idx = 0;
            vulnerability_idx < report.vulnerabilities.length;
            vulnerability_idx++
        ) {
            const vulnerability = report.vulnerabilities[vulnerability_idx];
            const reference_items = vulnerability.References.map(
                (reference) => `- ${reference}`,
            ).join("\n");
            issue_body += `## \`${vulnerability.VulnerabilityID}\` - ${vulnerability.Title}\n\n${vulnerability.Description}\n\n### Severity\n**${vulnerability.Severity}**\n\n### Primary URL\n${vulnerability.PrimaryURL}\n\n### References\n${reference_items}\n\n`;
        }
        issues.push({
            id: report.id,
            report: report,
            title: issue_title,
            body: issue_body,
        });
    }
    return issues;
}
