export interface BusinessUseCase {
  id: string;
  agentName: string;
  title: string;
  challenge: string;
  solution: string;
  businessRequirements: string[];
  icon: string;
}

export const businessUseCases: BusinessUseCase[] = [
  {
    id: "133372bc-b562-45ee-b7f4-89aea56ea77c",
    agentName: "Employee Growth Navigator",
    title: "Unified Career Development Platform",
    challenge: "Employees struggle to navigate fragmented systems for learning, job opportunities, and career planning, leading to missed growth opportunities and reduced internal mobility.",
    solution: "An intelligent agent that seamlessly connects learning management and recruitment platforms, providing personalized career paths, skill assessments, and job matching—all in one unified experience.",
    businessRequirements: [
      "Integrate multiple systems for a unified employee experience",
      "Provide personalized career development paths based on aspirations and skill gaps",
      "Enhance internal mobility by aligning current skills with available roles"
    ],
    icon: "GraduationCap"
  },
  {
    id: "90a5d52a-6e1d-44a5-ae98-cefc14f0e2cf",
    agentName: "Leadership Insights Agent",
    title: "Data-Driven HR Intelligence",
    challenge: "HR leaders lack real-time visibility into workforce metrics and struggle to identify issues before they become critical, resulting in reactive rather than proactive decision-making.",
    solution: "An analytics-powered agent that continuously monitors HR databases, detects anomalies against predefined targets, and delivers actionable recommendations to improve organizational performance.",
    businessRequirements: [
      "Access and analyze internal HR databases securely in real-time",
      "Identify problems and anomalies based on predefined performance targets",
      "Provide actionable recommendations leveraging best practices and online resources"
    ],
    icon: "BarChart3"
  },
  {
    id: "6e2a1a5b-bd14-47bc-8f84-32047c2431f9",
    agentName: "Sally",
    title: "Intelligent Interview & Off-boarding Automation",
    challenge: "HR teams spend countless hours coordinating interview schedules, managing calendar conflicts, and tracking off-boarding processes—reducing time available for strategic work.",
    solution: "Sally automates the entire scheduling lifecycle by syncing calendars, generating self-service booking links, sending confirmations, integrating recording/transcription tools, and managing exit interviews—all without human intervention.",
    businessRequirements: [
      "Reduce administrative burden by automating interview and exit scheduling",
      "Integrate with interviewers' calendars and Meta View for seamless recording",
      "Streamline off-boarding processes to enhance efficiency and compliance"
    ],
    icon: "Calendar"
  },
  {
    id: "f11e37fc-91c9-4247-bff1-0ebc203a0e8a",
    agentName: "Salary Grading Agent",
    title: "Fair & Competitive Compensation Intelligence",
    challenge: "Determining fair and competitive salaries is time-consuming and inconsistent, leading to pay inequities and difficulties attracting top talent in competitive markets.",
    solution: "An intelligent compensation agent that evaluates candidate qualifications, benchmarks against industry standards, assesses internal peer compensation, and recommends salary grades—ensuring fairness and market competitiveness.",
    businessRequirements: [
      "Analyze employee qualifications and compare with industry standards",
      "Assess peer compensation to ensure internal equity and fairness",
      "Recommend salary grades based on defined criteria and market data"
    ],
    icon: "DollarSign"
  }
];
