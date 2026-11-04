
export type TeamRole = "head" | "mentor";

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
    image: "/Dr-Sonali-Sagar-Patil.png",
    professionalMemberships: ["ISTE"],
    email: "sonalip@isquareit.edu.in",
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
];

export function getTeamHead(): TeamMember | undefined {
  return teamMembers.find((member) => member.role === "head");
}

export function getTeamMentors(): TeamMember[] {
  return teamMembers.filter((member) => member.role === "mentor");
}
