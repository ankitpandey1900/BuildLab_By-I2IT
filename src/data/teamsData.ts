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
  portfolio?: string;
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
    id: "ankit-pandey",
    role: "team",
    name: "Ankit Pandey",
    designation: "Lead Developer",
    qualifications: "B.E. Information Technology",
    teachingExperience: "Exploring Web Scalable Systems , Will Figure out for teaching",
    industryExperience: "Freelance & Industry Projects",
    specialization: "Pure Vibe Coder,Web Development, Devop's",
    description:
      "I build products. Life ? Still in debugging mode.",
    portfolio: "ankitpandey19.vercel.app",
    image: "/ankitpandey.webp",
    email: "ankit1pandey11@gmail.com",
    github: "http://github.com/ankitpandey1900",
    linkedin: "https://www.linkedin.com/in/ankitpandey1900/",
  },
  {
    id: "ayush-rohilla",
    role: "team",
    name: "Ayush Rohilla",
    designation: "Frontend Developer",
    qualifications: "B.E. Information Technology",
    teachingExperience: "",
    industryExperience: "",
    specialization:
      "React, TypeScript, Tailwind CSS, Responsive UI Development, Component Architecture & Frontend Integration",
    description:
      "Develops responsive and scalable user interfaces, builds reusable frontend components, and integrates APIs to deliver seamless user experiences across the BuildLab platform.",
    image: "/ayushrohilla.webp",
    email: "ayushrohilla0807@gmail.com",
    github: "https://github.com/ayushrohilla0807-hash",
    linkedin: "https://www.linkedin.com/in/ayush-rohilla0807",
  },


  {
    id: "abhishek-mondal",
    role: "team",
    name: "Abhishek Mondal",
    designation: "Backend Developer",
    qualifications: "B.E. Information Technology",
    teachingExperience: "",
    industryExperience: "",
    specialization:
      "Node.js, Authentication & Authorization, OAuth 2.0, Web Security, Database Management & API Security",
    description:
      "Builds reliable backend systems with a focus on authentication, authorization, and application security. Implements secure API workflows, manages access control, and helps maintain the integrity of platform data.",
    image: "/abhishekhmondal.webp",
    portfolio: 'avii.in',
    email: "abhishekmondal444@gmail.com",
    github: "https://github.com/code-with-avii",
    linkedin: "https://www.linkedin.com/in/abhishekh07/",
  },
  {
    id: "ayush-musale",
    role: "team",
    name: "Ayush Musale",
    designation: "Backend Developer",
    qualifications: "B.E. Information Technology",
    teachingExperience: "",
    industryExperience: "",
    specialization:
      "Node.js, Express.js, PostgreSQL, Prisma ORM, REST APIs, Database Design & Backend Architecture",
    description:
      "Develops secure and scalable backend services, designs efficient database architectures, and implements API integrations and server-side workflows that power BuildLab applications.",
    image: "/",
    portfolio: 'ayushmusale.in',
    email: "aayushmusale05@gmail.com",
    github: "https://github.com/ayushmusale",
    linkedin: "https://www.linkedin.com/in/ayushmusale/",
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
