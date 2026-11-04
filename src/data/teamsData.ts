export type TeamRole = "head" | "mentor" | "team";

export interface TeamMember {
  id: string;
  role: TeamRole;
  name: string;
  designation: string;
  qualifications: string;
  teachingExperience: string;
  industryExperience: string;
  specialization: string;
  description: string;
  image: string;
  professionalMemberships?: string[];
  github?: string;
  linkedin?: string;
  email?: string;
}

export const teamMembers: TeamMember[] = [
  {
    id: "dr-v-rajesh-chowdhary",
    role: "head",
    name: "Prof. (Dr.) Rajesh Chowdhary",
    designation: "Associate Professor",
    qualifications: "PhD",
    teachingExperience: "14 years",
    industryExperience: "Nil",
    specialization:
      "GNSS, Space Weather, Web Geographic Information System, RS&GIS Applications in Urban Planning & Management, Agriculture",
    description:
      "Research interests include GNSS, space weather, geographic information systems, remote sensing, urban planning, and agricultural applications.",
    image: "/Dr-V-Rajesh-Chowdhary-1.webp",
    email: "vrajeshc@isquareit.edu.in",
    github: "https://github.com",
    linkedin: "https://linkedin.com",
  },
  {
    id: "sonali-sagar-patil",
    role: "mentor",
    name: "Prof. (Dr.) Sonali Patil",
    designation: "Professor",
    qualifications:
      "PhD (Computer Engineering), M.E. in CSE, B.E. in CSE",
    teachingExperience: "16.5 years",
    industryExperience: "3.5 years",
    specialization:
      "Machine Learning, Deep Learning, Artificial Intelligence, Data Science, Blockchain Technology, Image Processing, IoT, Data Mining",
    description:
      "Research interests include machine learning, deep learning, artificial intelligence, data science, blockchain technology, image processing, IoT, and data mining.",
    image: "/Dr-Sonali-Sagar-Patil.webp",
    professionalMemberships: ["ISTE"],
    email: "sonalip@isquareit.edu.in",
    github: "https://github.com",
    linkedin: "https://linkedin.com",
  },
  {
    id: "risil-rameshbhai-chhatrala",
    role: "mentor",
    name: "Prof. (Dr.) Risil Chhatrala",
    designation: "Associate Professor",
    qualifications:
      "PhD, M.Tech (Electronics and Telecommunication), BE in Industrial Electronics",
    teachingExperience: "18 years",
    industryExperience: "Nil",
    specialization:
      "Pattern Recognition, Image and Video Processing, Information Theory, Error Control Coding",
    description:
      "Research interests include pattern recognition, image and video processing, information theory, and error control coding.",
    image: "/Dr-Risil-Rameshbhai-Chhatrala-3.webp",
    email: "risilc@isquareit.edu.in",
    github: "https://github.com",
    linkedin: "https://linkedin.com",
  },
  {
    id: "ms-anjali-anandrao-jagtap",
    role: "mentor",
    name: "Prof. Anjali Jagtap",
    designation: "Assistant Professor",
    qualifications: "ME Communication Network",
    teachingExperience: "15 years",
    industryExperience: "05 months",
    specialization: "Control System, Computer Network",
    description:
      "Areas of interest include control systems and computer networks.",
    image: "/Ms-Anjali-Anandrao-Jagtap-1.webp",
    email: "anjalij@isquareit.edu.in",
    github: "https://github.com",
    linkedin: "https://linkedin.com",
  },
  {
    id: "ayaan-maldar",
    role: "team",
    name: "Ayaan Maldar",
    designation: "Team Lead & Full-Stack Developer",
    qualifications: "B.E. Computer Engineering",
    teachingExperience: "Peer Mentor & Tech Workshop Lead",
    industryExperience: "1.5 years (Full-Stack Intern)",
    specialization: "Next.js, TypeScript, Distributed Systems & Product Architecture",
    description:
      "Leads the core engineering team, drives product roadmap, and oversees architecture across BuildLab campus repositories.",
    image: "/ayaan-avatar.png",
    email: "ayaan@buildlab.i2it.edu",
    github: "https://github.com",
    linkedin: "https://linkedin.com",
  },
  {
    id: "riya-deshmukh",
    role: "team",
    name: "Riya Deshmukh",
    designation: "Backend & DevOps Engineer",
    qualifications: "B.E. Information Technology",
    teachingExperience: "Linux & Docker Workshop Lead",
    industryExperience: "1 year (Cloud & DevOps Intern)",
    specialization: "Node.js, PostgreSQL, Docker, CI/CD & Cloud Infrastructure",
    description:
      "Architects scalable backend APIs, containerized deployment pipelines, and database optimization for campus repositories.",
    image: "/riya-avatar.png",
    email: "riya@buildlab.i2it.edu",
    github: "https://github.com",
    linkedin: "https://linkedin.com",
  },
  {
    id: "aarav-sharma",
    role: "team",
    name: "Aarav Sharma",
    designation: "Systems & Embedded Engineer",
    qualifications: "B.E. Electronics & Telecommunication",
    teachingExperience: "Microcontrollers Workshop Mentor",
    industryExperience: "10 months (Firmware Engineer Intern)",
    specialization: "ESP32, C/C++, MQTT, Real-Time Telemetry & Hardware Interfacing",
    description:
      "Builds high-reliability telemetry firmware, sensor data pipelines, and hardware integration modules for campus lab projects.",
    image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80",
    email: "aarav@buildlab.i2it.edu",
    github: "https://github.com",
    linkedin: "https://linkedin.com",
  },
  {
    id: "priya-patel",
    role: "team",
    name: "Priya Patel",
    designation: "Frontend & UI/UX Engineer",
    qualifications: "B.E. Information Technology",
    teachingExperience: "Design Systems & A11y Mentor",
    industryExperience: "8 months (Frontend UI Developer)",
    specialization: "React, Tailwind CSS, Framer Motion, Design Systems & A11y",
    description:
      "Designs responsive component libraries, accessible interfaces, and micro-interactions for the BuildLab platform.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
    email: "priya@buildlab.i2it.edu",
    github: "https://github.com",
    linkedin: "https://linkedin.com",
  },
  {
    id: "rohan-deshmukh",
    role: "team",
    name: "Rohan Deshmukh",
    designation: "Security & Open-Source Maintainer",
    qualifications: "B.E. Computer Engineering",
    teachingExperience: "Git Workflows & Security Auditing Peer Lead",
    industryExperience: "6 months (Application Security Intern)",
    specialization: "OAuth 2.0, Web Security, Cryptographic Signatures & Code Review",
    description:
      "Maintains contributor verification pipelines, enforces code signing standards, and audits community security policies.",
    image: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=400&q=80",
    email: "rohan@buildlab.i2it.edu",
    github: "https://github.com",
    linkedin: "https://linkedin.com",
  },
];

export function getTeamHead(): TeamMember | undefined {
  return teamMembers.find((member) => member.role === "head");
}

export function getTeamMentors(): TeamMember[] {
  return teamMembers.filter((member) => member.role === "mentor");
}

export function getTeamList(): TeamMember[] {
  return teamMembers.filter((member) => member.role === "team");
}
