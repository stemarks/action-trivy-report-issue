export interface VulnerabilityDict {
  VulnerabilityID: string;
  PkgName: string;
  InstalledVersion: string;
  FixedVersion?: string;
  Title: string;
  Description: string;
  Severity: string;
  PrimaryURL: string;
  References: string[];
}

export interface ResultDict {
  Type: string;
  Target: string;
  Vulnerabilities: VulnerabilityDict[];
}

export interface ReportDict {
  Results: ResultDict;
}

export interface IssueInputs {
  filename: string;
  labels: string[];
  assignees?: string[];
  createLabels: boolean;
  enableFixLabel: boolean;
  fixLabel?: string;
}

export interface IssueOption extends IssueInputs {
  title: string;
  body: string;
}

export interface IssueResponse {
  issueNumber: number;
  htmlUrl: string;
}

export interface TrivyIssue {
  number: number;
  title: string;
  body: string;
  state: string;
  labels: string[];
  html_url: string;
}
