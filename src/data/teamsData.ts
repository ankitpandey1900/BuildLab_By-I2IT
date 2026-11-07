export type TeamRole = "head" | "mentor" | "team";

export interface TeamMember {
  id: string;
  role: TeamRole;
  name: string;
  designation: string;
  qualifications: string;
  teachingExperience: string;
  industryExperience: string;
  specialization: string[];
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
    specialization: [
      "GNSS",
      "Space Weather",
      "Web GIS",
      "Remote Sensing",
      "Urban Planning",
      "Agriculture",
    ],
    description:
      "Specializes in GNSS, space weather, GIS, remote sensing, and their applications in urban planning and agriculture.",
    image: "/Dr-V-Rajesh-Chowdhary-1.webp",
    email: "vrajeshc@isquareit.edu.in",
    github: "https://github.com",
    linkedin: "https://www.linkedin.com/in/dr-vattikuti-rajesh-chowdhary-81416616/",
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
    specialization: [
      "Machine Learning",
      "Deep Learning",
      "Artificial Intelligence",
      "Data Science",
      "Blockchain",
      "IoT",
      "Data Mining",
      "Image Processing",
    ],
    description:
      "Specializes in AI, machine learning, deep learning, data science, blockchain, and image processing.",
    image: "/Dr-Sonali-Sagar-Patil.webp",
    professionalMemberships: ["ISTE"],
    email: "sonalip@isquareit.edu.in",
    github: "https://github.com",
    linkedin: "https://www.linkedin.com/in/dr-sonali-s-patil-27121335a/",
  },
  {
    id: "risil-rameshbhai-chhatrala",
    role: "mentor",
    name: "Prof. (Dr.) Risil Chhatrala",
    designation: "Associate Professor",
    qualifications:
      "PhD, M.Tech (EnTC), BE in Industrial Electronics",
    teachingExperience: "18 years",
    industryExperience: "Nil",
    specialization: [
      "Pattern Recognition",
      "Image Processing",
      "Video Processing",
      "Information Theory",
      "Error Control Coding",
    ],
    description:
      "Specializes in pattern recognition, image and video processing, information theory, and error control coding.",
    image: "/Dr-Risil-Rameshbhai-Chhatrala-3.webp",
    email: "risilc@isquareit.edu.in",
    github: "https://github.com/risil",
    linkedin: "https://www.linkedin.com/in/dr-risil-chhatrala-13a3778/",
  },
  {
    id: "ms-anjali-anandrao-jagtap",
    role: "mentor",
    name: "Prof. Anjali Jagtap",
    designation: "Assistant Professor",
    qualifications: "ME Communication Network",
    teachingExperience: "15 years",
    industryExperience: "05 months",
    specialization: ["Control System", "Computer Network"],
    description:
      "Focuses on control systems, computer networks, and communication technologies.",

    image: "/Ms-Anjali-Anandrao-Jagtap-1.webp",
    email: "anjalij@isquareit.edu.in",
    github: "https://github.com",
    linkedin: "https://www.linkedin.com/in/anjali-jagtap-9a3419231/",
  },
  {
    id: "ankit-pandey",
    role: "team",
    name: "Ankit Pandey",
    designation: "Lead Developer",
    qualifications: "B.E. Information Technology",
    teachingExperience: "Exploring Web Scalable Systems , Will Figure out for teaching",
    industryExperience: "Freelance & Industry Projects",
    specialization: [
      "Pure Vibe Coder",
      "Full Stack Dev",
      "Product Engineering",
      "Rapid Development",
      "Product Thinking",
      "Strategic Decision Making",
      "AI-Powered Development",
      "Technical Architecture",
      "DevOps",
    ],
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
    specialization: [
      "React",
      "TypeScript",
      "Tailwind CSS",
      "Responsive UI",
      "Component Architecture",
      "Frontend Integration",
    ],
    description:
      "Builds responsive interfaces and reusable frontend components for seamless user experiences.",
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
    specialization: [
      "Node.js",
      "Authentication & Authorization",
      "OAuth 2.0",
      "Web Security",
      "Database Management",
      "API Security",
    ],
    description:
      "Develops secure backend systems with expertise in authentication, authorization, and API security.",
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
    specialization: [
      "Node.js",
      "Express.js",
      "PostgreSQL",
      "Prisma ORM",
      "REST APIs",
      "Database Design",
      "Backend Architecture",
    ],
    description:
      "Builds secure & scalable backend services, designs databases, and develops efficient REST APIs.",
    image: "/ayushmusale.jpg",
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
