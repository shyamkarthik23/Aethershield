// Mock multi-cloud inventory data.
// In a real deployment this would come from FastAPI endpoints backed by
// boto3 / Azure SDK / GCP client libraries. For this project we simulate
// the shape of that data so the rule engine + dashboard can be demoed
// without needing live cloud credentials.

export const initialAssets = [
  {
    id: 'res-aws-s3-01',
    name: 'prod-billing-invoices',
    provider: 'AWS',
    serviceType: 'S3 Bucket',
    status: 'DANGER',
    details: 'Public Read Access enabled on bucket ACL',
    severity: 'Critical',
  },
  {
    id: 'res-aws-sg-02',
    name: 'web-server-secgroup',
    provider: 'AWS',
    serviceType: 'Security Group',
    status: 'DANGER',
    details: 'Port 22 (SSH) open to public internet (0.0.0.0/0)',
    severity: 'Critical',
  },
  {
    id: 'res-aws-iam-03',
    name: 'deployer-svc-account',
    provider: 'AWS',
    serviceType: 'IAM User',
    status: 'WARNING',
    details: 'Access key older than 90 days',
    severity: 'Warning',
  },
  {
    id: 'res-azure-sql-04',
    name: 'sql-user-data',
    provider: 'Azure',
    serviceType: 'SQL Database',
    status: 'HEALTHY',
    details: 'Transparent Data Encryption enabled, private endpoint only',
    severity: 'Healthy',
  },
  {
    id: 'res-azure-vnet-05',
    name: 'prod-vnet-eastus',
    provider: 'Azure',
    serviceType: 'Virtual Network',
    status: 'HEALTHY',
    details: 'No open port 3389 rules detected',
    severity: 'Healthy',
  },
  {
    id: 'res-gcp-gke-06',
    name: 'checkout-cluster',
    provider: 'GCP',
    serviceType: 'GKE Cluster',
    status: 'WARNING',
    details: 'Workload identity not enforced on 2 node pools',
    severity: 'Warning',
  },
  {
    id: 'res-gcp-iam-07',
    name: 'temp-consultant-sa',
    provider: 'GCP',
    serviceType: 'Service Account',
    status: 'DANGER',
    details: 'Owner role granted, no expiry set',
    severity: 'Critical',
  },
  {
    id: 'res-aws-rds-08',
    name: 'analytics-rds-prod',
    provider: 'AWS',
    serviceType: 'RDS Instance',
    status: 'HEALTHY',
    details: 'Storage encryption enabled with KMS CMK',
    severity: 'Healthy',
  },
];

export const complianceFrameworks = [
  {
    id: 'cis',
    name: 'CIS Benchmarks v1.4',
    description: 'Consensus-based cloud security best practices.',
    pass: 12,
    fail: 3,
  },
  {
    id: 'soc2',
    name: 'SOC 2 Type II (Security)',
    description: 'Trust Services Criteria for cloud workloads.',
    pass: 28,
    fail: 6,
  },
  {
    id: 'hipaa',
    name: 'HIPAA Security Rule',
    description: 'Protection of Electronic Protected Health Information.',
    pass: 18,
    fail: 6,
  },
  {
    id: 'gdpr',
    name: 'GDPR Privacy Shield',
    description: 'General Data Protection Regulation for EU data.',
    pass: 15,
    fail: 6,
  },
];

export const initialPolicyRules = [
  {
    id: 'rule-01',
    name: 'Enforce KMS Storage Encryption',
    category: 'Data Protection',
    provider: 'ALL',
    severity: 'High',
    active: true,
    autoRemediate: false,
  },
  {
    id: 'rule-02',
    name: 'Block Public Storage Buckets',
    category: 'Data Protection',
    provider: 'AWS',
    severity: 'Critical',
    active: true,
    autoRemediate: true,
  },
  {
    id: 'rule-03',
    name: 'Restrict Public SSH/RDP',
    category: 'Network Security',
    provider: 'ALL',
    severity: 'Critical',
    active: true,
    autoRemediate: true,
  },
  {
    id: 'rule-04',
    name: 'Require MFA for IAM Consoles',
    category: 'Identity & Access',
    provider: 'AWS',
    severity: 'High',
    active: true,
    autoRemediate: false,
  },
  {
    id: 'rule-05',
    name: 'Restrict Wildcard IAM Roles',
    category: 'Identity & Access',
    provider: 'GCP',
    severity: 'Critical',
    active: true,
    autoRemediate: false,
  },
  {
    id: 'rule-06',
    name: 'Flag Idle Cryptomining Signatures',
    category: 'Threat Detection',
    provider: 'ALL',
    severity: 'High',
    active: true,
    autoRemediate: false,
  },
];

// Chaos Simulator events. Triggering one injects a new finding, raises
// the active threat count, and drops the global security score — this
// is what makes the dashboard feel alive in a live demo instead of static.
export const chaosEvents = [
  {
    id: 'chaos-sql-ransomware',
    title: 'SQL Database Ransomware Threat',
    provider: 'Azure',
    description:
      'A machine learning alert shows an external IP triggering mass exports from sql-user-data, followed by ALTER TABLE encryption actions.',
    findingTemplate: {
      id: 'res-azure-sql-04',
      name: 'sql-user-data',
      provider: 'Azure',
      serviceType: 'SQL Database',
      status: 'DANGER',
      details: 'Mass export + encryption tampering detected from untrusted IP',
      severity: 'Critical',
    },
    feedMessage: 'Anomalous export volume detected on sql-user-data',
    scoreImpact: -9,
  },
  {
    id: 'chaos-cryptomining',
    title: 'Cryptomining Node Injection',
    provider: 'GCP',
    description:
      'An unauthorized pod was spun up using dynamic API access. The pod is consuming 98% CPU and communicating with public Monero pools.',
    findingTemplate: {
      id: 'res-gcp-gke-06',
      name: 'checkout-cluster',
      provider: 'GCP',
      serviceType: 'GKE Cluster',
      status: 'DANGER',
      details: 'Unauthorized pod consuming 98% CPU, contacting known mining pool',
      severity: 'Critical',
    },
    feedMessage: 'Unauthorized workload detected on checkout-cluster',
    scoreImpact: -7,
  },
];

export const quickActions = [
  { id: 'qa-1', icon: '📊', label: 'Generate compliance posture analysis' },
  { id: 'qa-2', icon: '🔑', label: 'Fix GCP temp-consultant-sa Owner' },
  { id: 'qa-3', icon: '🌐', label: 'Remediate AWS open SSH Port 22' },
  { id: 'qa-4', icon: '🛡️', label: 'Explain auto-remediation policies' },
];
