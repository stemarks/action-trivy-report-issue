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
