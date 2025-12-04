export interface AgentResponsibility {
  name: string;
  description: string;
}

export interface WorkshopAgent {
  id: string;
  name: string;
  apiName: string;
  description: string;
  responsibilities: AgentResponsibility[];
  sampleUtterances: string[];
  icon: string;
  category: string;
}

export const workshopAgents: WorkshopAgent[] = [
  {
    id: "133372bc-b562-45ee-b7f4-89aea56ea77c",
    name: "Employee Growth Navigator",
    apiName: "employeeGrowthNavigator",
    description: "The Employee Growth Navigator aids employees in career development by integrating learning and recruitment systems. It recommends tailored learning paths, matches skills with job openings, supports talent management, and conducts skills assessments through interactive methods. This agent enhances internal mobility and assists employees in achieving their career goals.",
    responsibilities: [
      {
        name: "Personalized Learning Recommendations",
        description: "Analyze employee skills and career aspirations to recommend personalized learning paths and courses. If an employee has an ambition for a certain role that they currently lack skills for, the agent will provide a comprehensive plan and timeline to achieve the necessary skills, including suggesting a skills assessment."
      },
      {
        name: "Job Role Matching",
        description: "Match employees' current skills with available job openings within the company. This responsibility addresses the need for internal mobility by identifying roles that employees are well-suited for. The outcome is increased opportunities for career advancement and retention of talent."
      },
      {
        name: "Skills Assessment",
        description: "Conduct skill assessments by engaging employees through interactive quizzes and guided questions to explore their skill sets. This responsibility aids in discovering the hidden potential and unrecognized skills that employees may possess, enabling them to map out potential career paths accurately."
      }
    ],
    sampleUtterances: [
      "What courses should I take to become a project manager?",
      "Can you help me create a learning plan to improve my leadership skills?",
      "Can you help me find a job role that matches my skills?",
      "What job openings are available for someone with my skill set?",
      "Can you help me assess my skills for a potential career change?",
      "I want to discover my hidden skills and explore new career paths."
    ],
    icon: "GraduationCap",
    category: "Career Development"
  },
  {
    id: "90a5d52a-6e1d-44a5-ae98-cefc14f0e2cf",
    name: "Leadership Insights Agent",
    apiName: "leadershipInsightsAgent",
    description: "The Leadership Insights Agent is designed to access internal HR databases, collect HR metrics, identify problems or anomalies based on predefined targets, and provide actionable recommendations by leveraging online resources. It aims to enable managers to make informed decisions and improve organizational performance.",
    responsibilities: [
      {
        name: "Access HR Databases",
        description: "The agent will securely access internal HR databases to retrieve relevant HR metrics and data. This task addresses the need for accurate and up-to-date information, enabling managers to have a comprehensive view of the current HR landscape. The outcome is a reliable data foundation for further analysis and decision-making."
      },
      {
        name: "Identify HR Anomalies",
        description: "The agent will analyze collected HR metrics to identify any problems or anomalies that deviate from predefined targets. This responsibility addresses the need for early detection of potential issues within the organization, allowing managers to proactively address them. The expected outcome is the timely identification of areas requiring attention."
      },
      {
        name: "Provide Actionable Recommendations",
        description: "The agent will leverage online resources and best practices to provide actionable recommendations based on identified HR anomalies. This task addresses the need for informed decision-making by offering practical solutions to improve organizational performance. The outcome is enhanced managerial decision-making and strategic planning."
      }
    ],
    sampleUtterances: [
      "Can you retrieve the latest HR metrics for the sales department?",
      "I need the turnover rate and average tenure for the last quarter.",
      "What anomalies have been detected in the HR metrics this quarter?",
      "Can you analyze the HR data to find any deviations from the targets?",
      "What are some best practices for addressing high employee turnover?",
      "Can you provide recommendations for improving employee engagement?"
    ],
    icon: "BarChart3",
    category: "Analytics & Insights"
  },
  {
    id: "6e2a1a5b-bd14-47bc-8f84-32047c2431f9",
    name: "Sally",
    apiName: "sallyScheduler",
    description: "Sally is designed to streamline the scheduling process for interviews and off-boarding at NTO. This intelligent agent connects with interviewers' calendars to identify open slots or reschedulable meetings, generates scheduling links for candidates, and handles email communications to facilitate self-selection of interview slots. Once a candidate selects a time slot, Sally ensures both parties receive a confirmation along with calendar invites. Additionally, Sally integrates with Meta View to automatically add recording and transcription functionalities to interviews. Beyond interviews, Sally manages the off-boarding process by scheduling exit interviews automatically, all without the need for human intervention.",
    responsibilities: [
      {
        name: "Calendar Synchronization",
        description: "Synchronize with interviewers' calendars to identify available time slots and reschedulable meetings. This ensures that scheduling is efficient and does not conflict with existing commitments, reducing the need for manual coordination."
      },
      {
        name: "Interview Scheduling Automation",
        description: "Generate scheduling links for candidates to self-select interview slots, and send confirmation emails with calendar invites to both parties. This streamlines the interview scheduling process, minimizing back-and-forth communication and ensuring all parties are informed."
      },
      {
        name: "Meta View Integration",
        description: "Integrate with Meta View to automatically add recording and transcription functionalities to scheduled interviews. This ensures that all interviews are documented and accessible for future reference, enhancing the interview process's transparency and accountability."
      },
      {
        name: "Exit Interview Scheduling",
        description: "Automate the scheduling of exit interviews by identifying suitable time slots and sending invitations to departing employees. This responsibility ensures that the off-boarding process is handled efficiently, maintaining compliance and reducing the administrative workload on HR."
      }
    ],
    sampleUtterances: [
      "Can you find available time slots for my interview next week?",
      "I need to reschedule my meeting, what are the available options?",
      "Can you help me schedule an interview with a candidate?",
      "I need to send a confirmation email for an interview slot.",
      "Can you ensure that the upcoming interview is recorded and transcribed?",
      "What should I do if the Meta View integration isn't working for my interview?",
      "Can you schedule an exit interview for a departing employee?",
      "I need to reschedule my exit interview, can you help with that?"
    ],
    icon: "Calendar",
    category: "Scheduling & Automation"
  },
  {
    id: "f11e37fc-91c9-4247-bff1-0ebc203a0e8a",
    name: "Salary Grading Agent",
    apiName: "salaryGradingAgent",
    description: "The Salary Grading Agent evaluates new candidates or employees, compares compensation with peers, and proposes suitable salaries for individuals within NTO. The agent analyzes employee qualifications, compares with industry standards, assesses peer compensation, and recommends salary grades based on defined criteria.",
    responsibilities: [
      {
        name: "Evaluate Candidate Qualifications",
        description: "Analyze the qualifications, skills, and experience of new candidates or employees to determine their suitability for specific roles within NTO. This task addresses the need to ensure that individuals meet the necessary criteria for their positions, thereby supporting informed hiring and promotion decisions. The outcome is a comprehensive assessment report that highlights the strengths and potential areas for development of each candidate."
      },
      {
        name: "Compare Industry Compensation",
        description: "Conduct a thorough analysis of industry compensation standards to benchmark NTO's salary offerings against those of competitors. This responsibility addresses the need to maintain competitive compensation packages that attract and retain top talent. The expected outcome is a detailed report that outlines how NTO's salaries compare to industry averages and identifies any discrepancies."
      },
      {
        name: "Assess Peer Compensation",
        description: "Evaluate the compensation of current employees within NTO to ensure internal equity and fairness. This task involves comparing salaries among peers in similar roles and identifying any inconsistencies. The outcome is a set of recommendations for salary adjustments to align with internal standards and promote fairness across the organization."
      },
      {
        name: "Recommend Salary Grades",
        description: "Based on the analysis of qualifications, industry standards, and peer compensation, propose suitable salary grades for individuals. This responsibility addresses the need to align compensation with both market conditions and internal equity. The expected outcome is a set of salary recommendations that are fair, competitive, and aligned with NTO's compensation strategy."
      }
    ],
    sampleUtterances: [
      "Can you evaluate the qualifications of this candidate for the software engineer role?",
      "What are the strengths and areas for development for this candidate based on their resume?",
      "How do NTO's salaries compare to industry standards?",
      "Can you generate a report on our salary competitiveness?",
      "How do salaries compare among peers in similar roles?",
      "Can you identify any salary inconsistencies within the team?",
      "What salary grade should we offer to a new candidate with these qualifications?",
      "Can you recommend a salary adjustment for an employee based on their performance and peer compensation?"
    ],
    icon: "DollarSign",
    category: "Compensation"
  }
];
