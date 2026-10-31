import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Ensure seed can execute in demo mode
process.env.ALLOW_DEMO_SEED = "true";

interface SeedUserData {
  id: string;
  githubUsername: string;
  name: string;
  email: string;
  role: string;
  bio: string;
  branchYear: string;
  department: string;
  academicYear: string;
  prnNumber?: string;
  rollNumber?: string;
  verificationStatus: "UNVERIFIED" | "PENDING_APPROVAL" | "VERIFIED" | "REJECTED";
  rejectionReason?: string;
  verifiedAt?: Date;
  skills: string[];
  interests: string[];
  availability: number;
  image: string;
}

// GitHub-first developer personas: No forced institutional emails, no passwords.
// College accreditation is achieved strictly through the Campus Verification Gate (PRN + Roll Number + Department).
const seedUsers: SeedUserData[] = [
  {
    id: "usr_aarav_sharma",
    githubUsername: "aarav-sharma",
    name: "Aarav Sharma",
    email: "aarav.sharma@gmail.com",
    role: "student",
    bio: "Junior CS student passionate about distributed systems, Rust, and building open-source tools for campus infrastructure.",
    branchYear: "Computer Engineering · 2026",
    department: "Computer Engineering",
    academicYear: "Third Year (TE)",
    prnNumber: "72234012A",
    rollNumber: "31142",
    verificationStatus: "VERIFIED",
    verifiedAt: new Date("2026-09-10T10:00:00Z"),
    skills: ["TypeScript", "React", "PostgreSQL", "Next.js", "Docker"],
    interests: ["Open Source", "Distributed Systems", "Campus Tools"],
    availability: 8,
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "usr_priya_patel",
    githubUsername: "priya-patel",
    name: "Priya Patel",
    email: "priya.patel.ai@gmail.com",
    role: "student",
    bio: "Final year IT engineer working on local LLMs, vector search, and academic information systems.",
    branchYear: "Information Technology · 2025",
    department: "Information Technology",
    academicYear: "Final Year (BE)",
    prnNumber: "72134045B",
    rollNumber: "42210",
    verificationStatus: "VERIFIED",
    verifiedAt: new Date("2026-09-12T11:30:00Z"),
    skills: ["Python", "FastAPI", "React", "Qdrant", "PostgreSQL", "PyTorch"],
    interests: ["AI/ML", "Information Retrieval", "Education Tech"],
    availability: 12,
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "usr_rohan_deshmukh",
    githubUsername: "rohan-deshmukh",
    name: "Rohan Deshmukh",
    email: "rohan.deshmukh.iot@gmail.com",
    role: "student",
    bio: "Hardware hacker, embedded developer, and president of Campus Robotics & IoT Club.",
    branchYear: "Electronics & Telecommunication · 2026",
    department: "Electronics & Telecommunication",
    academicYear: "Third Year (TE)",
    prnNumber: "72234089C",
    rollNumber: "33118",
    verificationStatus: "VERIFIED",
    verifiedAt: new Date("2026-09-15T14:15:00Z"),
    skills: ["C++", "ESP32", "MQTT", "FreeRTOS", "PCB Design", "Next.js"],
    interests: ["IoT", "Robotics", "Embedded Linux", "Firmware"],
    availability: 10,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "usr_ananya_kulkarni",
    githubUsername: "ananya-kulkarni",
    name: "Ananya Kulkarni",
    email: "ananya.kulkarni@gmail.com",
    role: "student",
    bio: "Sophomore developer interested in competitive programming, data structures, and intuitive developer interfaces.",
    branchYear: "Computer Engineering · 2027",
    department: "Computer Engineering",
    academicYear: "Second Year (SE)",
    prnNumber: "72334005D",
    rollNumber: "21104",
    // PENDING_APPROVAL: Populates Admin Verification Desk "Pending Review" queue for testing!
    verificationStatus: "PENDING_APPROVAL",
    skills: ["TypeScript", "Tailwind CSS", "Rust", "Figma", "WebAssembly"],
    interests: ["Competitive Programming", "UI/UX", "Rust Systems"],
    availability: 6,
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "usr_sanjay_joshi",
    githubUsername: "sanjay-joshi-i2it",
    name: "Dr. Sanjay Joshi",
    email: "sanjay.joshi@gmail.com",
    role: "faculty",
    bio: "Associate Professor & Faculty Advisor for Open Source & Student Research Incubations at I2IT.",
    branchYear: "Department of Computer Engineering",
    department: "Computer Engineering",
    academicYear: "Faculty / Mentor",
    prnNumber: "EMP-CS-104",
    rollNumber: "Associate Professor",
    verificationStatus: "VERIFIED",
    verifiedAt: new Date("2026-08-01T09:00:00Z"),
    skills: ["System Architecture", "Cloud Security", "Distributed Systems", "Academic Research"],
    interests: ["Open Source Governance", "Institutional Grants", "Student Mentorship"],
    availability: 4,
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "usr_vikram_shinde",
    githubUsername: "vikram-shinde",
    name: "Vikram Shinde",
    email: "vikram.shinde@gmail.com",
    role: "student",
    bio: "Engineering student interested in CAD tools and embedded hardware interfaces.",
    branchYear: "Mechanical Engineering · 2026",
    department: "Mechanical Engineering",
    academicYear: "Third Year (TE)",
    prnNumber: "72299999X",
    rollNumber: "99999",
    // REJECTED: Populates Admin Verification Desk "Rejected" queue with audit justification
    verificationStatus: "REJECTED",
    rejectionReason: "Mechanical Engineering branch is not offered at I2IT. Please submit with valid CE, IT, or E&TC roll number.",
    skills: ["Python", "MATLAB", "Arduino"],
    interests: ["Robotics", "CAD"],
    availability: 5,
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "usr_campus_admin",
    githubUsername: "i2it-campus-admin",
    name: "Campus Admin Desk",
    email: "admin.buildlab@gmail.com",
    role: "admin",
    bio: "Official administrative verification desk for BuildLab by I2IT campus operations.",
    branchYear: "Campus Administration",
    department: "Computer Engineering",
    academicYear: "Administration",
    prnNumber: "ADMIN-01",
    rollNumber: "Lead Administrator",
    verificationStatus: "VERIFIED",
    verifiedAt: new Date("2026-08-01T09:00:00Z"),
    skills: ["Administration", "Campus Governance", "Code Auditing"],
    interests: ["Campus Engineering", "Academic Grants"],
    availability: 40,
    image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"
  }
];

async function getOrCreateUser(data: SeedUserData) {
  let user = await prisma.user.findFirst({
    where: {
      OR: [
        { id: data.id },
        { email: data.email },
        ...(data.prnNumber ? [{ prnNumber: data.prnNumber }] : [])
      ]
    }
  });

  const userData = {
    name: data.name,
    email: data.email,
    emailVerified: true,
    image: data.image,
    role: data.role,
    bio: data.bio,
    branchYear: data.branchYear,
    department: data.department,
    academicYear: data.academicYear,
    prnNumber: data.prnNumber || null,
    rollNumber: data.rollNumber || null,
    verificationStatus: data.verificationStatus,
    rejectionReason: data.rejectionReason || null,
    verifiedAt: data.verifiedAt || null,
    skills: JSON.stringify(data.skills),
    interests: JSON.stringify(data.interests),
    availability: data.availability
  };

  if (!user) {
    user = await prisma.user.create({
      data: {
        id: data.id,
        ...userData
      }
    });
  } else {
    user = await (prisma.user as any).update({
      where: { id: user.id },
      data: userData
    });
  }

  if (!user) {
    throw new Error(`Failed to initialize user: ${data.name}`);
  }

  // Seed native GitHub OAuth Account record in Better Auth schema
  await prisma.account.upsert({
    where: {
      providerId_accountId: {
        providerId: "github",
        accountId: data.githubUsername
      }
    },
    update: {
      userId: user.id
    },
    create: {
      id: `acc_${data.githubUsername}`,
      userId: user.id,
      providerId: "github",
      accountId: data.githubUsername,
      accessToken: `gho_mock_${data.githubUsername}`,
      scope: "read:user,user:email,repo"
    }
  });

  return user;
}

async function main() {
  console.log("🌱 Starting GitHub-first campus community seed (ADR-0002)...");

  // 1. Seed All 7 Users with GitHub OAuth accounts
  const userMap: Record<string, any> = {};
  for (const uData of seedUsers) {
    const user = await getOrCreateUser(uData);
    if (user) {
      userMap[uData.githubUsername] = user;
      console.log(`✓ GitHub User ready: @${uData.githubUsername} (${user.name}) [${uData.role}] — Status: ${uData.verificationStatus}`);
    }
  }

  const aarav = userMap["aarav-sharma"];
  const priya = userMap["priya-patel"];
  const rohan = userMap["rohan-deshmukh"];
  const ananya = userMap["ananya-kulkarni"];
  const profJoshi = userMap["sanjay-joshi-i2it"];
  const vikram = userMap["vikram-shinde"];
  const adminUser = userMap["i2it-campus-admin"];

  if (!aarav || !priya || !rohan || !ananya || !profJoshi || !vikram || !adminUser) {
    throw new Error("Failed to initialize all required demo accounts.");
  }

  // Set Dr. Joshi as the verifier for verified students
  await prisma.user.updateMany({
    where: { id: { in: [aarav.id, priya.id, rohan.id] } },
    data: { verifiedById: profJoshi.id }
  });

  // 2. Seed Webhook Deliveries (For GitHub Health & Telemetry Sync)
  console.log("📡 Seeding GitHub webhook deliveries for telemetry health...");
  await prisma.webhookDelivery.upsert({
    where: { id: "wh-del-101" },
    update: { status: "processed" },
    create: {
      id: "wh-del-101",
      event: "pull_request",
      status: "processed",
      receivedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
      processedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3 + 1200)
    }
  });

  await prisma.webhookDelivery.upsert({
    where: { id: "wh-del-102" },
    update: { status: "processed" },
    create: {
      id: "wh-del-102",
      event: "push",
      status: "processed",
      receivedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
      processedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2 + 800)
    }
  });

  await prisma.webhookDelivery.upsert({
    where: { id: "wh-del-103" },
    update: { status: "processed" },
    create: {
      id: "wh-del-103",
      event: "issues",
      status: "processed",
      receivedAt: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
      processedAt: new Date(Date.now() - 1000 * 60 * 60 * 12 + 400)
    }
  });

  // 3. Seed Projects Across Different Tracks & Maturities
  console.log("📦 Seeding campus repositories with rich READMEs & tags...");

  // Project A: BuildLab Campus Platform (Official Renamed Repo!)
  const starterProject = await prisma.project.upsert({
    where: { slug: "buildlab-campus-platform" },
    update: { 
      ownerId: aarav.id,
      repositoryUrl: "https://github.com/ankitpandey1900/BuildLab_By-I2IT"
    },
    create: {
      ownerId: aarav.id,
      name: "BuildLab by I2IT — Campus Open Source Platform",
      slug: "buildlab-campus-platform",
      summary: "The official open-source developer hub and contribution verification platform for Hope Foundation's I2IT campus.",
      problemStatement: "Engineering students build isolated clones that disappear on graduation. BuildLab connects student developers across CE, IT, and E&TC with faculty-mentored production repositories, issue tracking, and cryptographically verified contribution receipts.",
      status: "active",
      maturity: "active",
      visibility: "college",
      tags: JSON.stringify(["Next.js", "TypeScript", "Tailwind CSS", "Prisma", "Better-Auth", "PostgreSQL"]),
      skills: JSON.stringify(["TypeScript", "React", "PostgreSQL", "Next.js", "Tailwind CSS"]),
      teamNeeds: JSON.stringify(["Fullstack Contributor", "UI/UX Reviewer", "DevOps Engineer"]),
      repositoryUrl: "https://github.com/ankitpandey1900/BuildLab_By-I2IT",
      license: "MIT",
      contributionGuide: "Fork https://github.com/ankitpandey1900/BuildLab_By-I2IT, clone locally, create a feature branch, and ensure `npm run typecheck` and `npm run build` pass before submitting PRs.",
      readme: `# BuildLab by I2IT
The official open-source developer platform for Hope Foundation's International Institute of Information Technology (I2IT), Pune.

## Architecture
- **Framework:** Next.js 16 (App Router & Server Actions)
- **Database:** PostgreSQL on Supabase via Prisma ORM (Dual Connection Pooler)
- **Authentication:** Better Auth with GitHub OAuth & Campus PRN Gate
- **Styling:** Tailwind CSS with Dark/Light/Amber workspace themes

## Quickstart
\`\`\`bash
git clone https://github.com/ankitpandey1900/BuildLab_By-I2IT.git
cd BuildLab_By-I2IT
npm install
npm run dev
\`\`\``
    }
  });

  // Project B: Campus Shuttle Live GPS Telemetry (Rohan) - Community Supported (College Backed!)
  const shuttleProject = await prisma.project.upsert({
    where: { slug: "campus-ride-telemetry" },
    update: { ownerId: rohan.id },
    create: {
      ownerId: rohan.id,
      name: "Campus Shuttle Live GPS Telemetry",
      slug: "campus-ride-telemetry",
      summary: "Real-time bus tracking and ETA telemetry for campus shuttles using solar-powered ESP32 sensors and MQTT brokers.",
      problemStatement: "Residential students and commuters face unpredictable shuttle arrival times between the campus gate and hostel clusters. This system provides sub-second GPS telemetry and route visualization.",
      status: "community_supported",
      maturity: "active",
      visibility: "college",
      tags: JSON.stringify(["IoT", "ESP32", "MQTT", "Hardware", "C++", "Leaflet"]),
      skills: JSON.stringify(["C++", "ESP32", "MQTT", "Next.js", "PostgreSQL", "Leaflet"]),
      teamNeeds: JSON.stringify(["Fullstack Maintainer", "Embedded Firmware Hacker", "Mobile App Dev"]),
      repositoryUrl: "https://github.com/college-dev/campus-ride-telemetry",
      license: "Apache-2.0",
      contributionGuide: "Follow the hardware setup schematic in /docs/hardware.md. Firmware builds using PlatformIO.",
      readme: `# Campus Shuttle Live GPS Telemetry
Real-time bus tracking with solar-powered ESP32 microcontrollers and MQTT broker relays for I2IT transit.

## Hardware Stack
- ESP32 WROOM-32 MCU
- SIM800L GPRS/GSM Fallback Module
- NEO-6M GPS Receiver Module
- MQTT Telemetry Broker on Mosquitto`
    }
  });

  // Project C: OpenSyllabus Intelligence (Priya) - Community Supported (College Backed!)
  const syllabusProject = await prisma.project.upsert({
    where: { slug: "open-syllabus-i2it" },
    update: { ownerId: priya.id },
    create: {
      ownerId: priya.id,
      name: "OpenSyllabus & Past Paper Intelligence",
      slug: "open-syllabus-i2it",
      summary: "Curated archive of university exam papers, professor lecture notes, and semantic vector search across 8 engineering departments.",
      problemStatement: "Engineering exam papers and handwritten lecture notes are fragmented across random WhatsApp groups and dead Google Drive links. This searchable semantic archive centralizes 5 years of vetted coursework.",
      status: "community_supported",
      maturity: "active",
      visibility: "college",
      tags: JSON.stringify(["Python", "FastAPI", "AI/ML", "Vector Search", "Qdrant", "NLP"]),
      skills: JSON.stringify(["Python", "FastAPI", "React", "Qdrant", "PostgreSQL", "Docker"]),
      teamNeeds: JSON.stringify(["Data Pipeline Contributor", "Vector Search Engineer"]),
      repositoryUrl: "https://github.com/college-dev/open-syllabus-i2it",
      license: "MIT",
      contributionGuide: "Run docker compose up to spin up the local Qdrant vector database and FastAPI server.",
      readme: `# OpenSyllabus & Past Paper Intelligence
Semantic search and question paper retrieval system for SPPU engineering syllabus.

## Tech Stack
- **API:** FastAPI (Python 3.11)
- **Embeddings:** all-MiniLM-L6-v2 via SentenceTransformers
- **Vector DB:** Qdrant Vector Engine
- **Frontend:** React + Tailwind CSS`
    }
  });

  // Project D: IoT Lab Equipment Reservation (Aarav) - Independent with SUBMITTED Application
  const labProject = await prisma.project.upsert({
    where: { slug: "lab-scheduler-iot" },
    update: { ownerId: aarav.id },
    create: {
      ownerId: aarav.id,
      name: "IoT Lab Testbench Reservation System",
      slug: "lab-scheduler-iot",
      summary: "Automated bench booking and logic analyzer reservation system for student robotics and VLSI lab experiments.",
      problemStatement: "Hardware testbenches in Lab 304 have high contention before semester submission weeks. This scheduler prevents walk-in conflicts and automates NFC badge checkouts.",
      status: "active",
      maturity: "active",
      visibility: "college",
      tags: JSON.stringify(["TypeScript", "React", "Hardware", "NFC", "Scheduler", "Prisma"]),
      skills: JSON.stringify(["TypeScript", "React", "Prisma", "PostgreSQL", "Tailwind CSS"]),
      teamNeeds: JSON.stringify(["Frontend & UI/UX Contributor", "NFC Hardware Integrator"]),
      repositoryUrl: "https://github.com/aarav-sharma/lab-scheduler-iot",
      license: "MIT",
      contributionGuide: "Fork and run npm run dev. Mock hardware endpoints available in /api/mock/rfid."
    }
  });

  // Project E: GATE CS Algorithm Drill (Ananya) - Prototype
  await prisma.project.upsert({
    where: { slug: "gate-prep-tracker" },
    update: { ownerId: ananya.id },
    create: {
      ownerId: ananya.id,
      name: "GATE CS Algorithm Drill Platform",
      slug: "gate-prep-tracker",
      summary: "Spaced-repetition practice platform for computer science theory, algorithms, and GATE engineering entrance problems.",
      problemStatement: "Students preparing for GATE lack an interactive algorithm simulator to visualize dynamic programming graphs and time complexities directly in browser.",
      status: "active",
      maturity: "prototype",
      visibility: "college",
      tags: JSON.stringify(["Rust", "WebAssembly", "Algorithms", "GATE", "CS"]),
      skills: JSON.stringify(["Rust", "WebAssembly", "TypeScript", "Tailwind CSS"]),
      teamNeeds: JSON.stringify(["Algorithm Content Contributor", "Rust WebAssembly Dev"]),
      repositoryUrl: "https://github.com/ananya-k/gate-prep-tracker",
      license: "MIT"
    }
  });

  // 4. Seed Support Applications & Decisions
  console.log("🏛️ Seeding sponsorship applications & reviewer evaluations...");

  // Application 1: Campus Shuttle -> APPROVED by Dr. Joshi
  await prisma.supportApplication.upsert({
    where: { projectId: shuttleProject.id },
    update: {},
    create: {
      projectId: shuttleProject.id,
      status: "approved",
      problem: "Campus shuttle delays during evening hours create safety concerns and crowding at the main campus gate.",
      targetAudience: "3,200+ residential students, faculty, and daily transit commuters across campus routes.",
      requestedSupport: JSON.stringify(["@college-dev Org Transfer", "Hardware Lab Keys", "Campus Subdomain (shuttle.isquareit.edu.in)", "$500 Cloud Grants"]),
      risksAndMitigations: "GPS signal loss under dense tree cover is mitigated by cell-tower triangulation fallback.",
      nextMilestone: "Install solar-powered telemetry units on remaining 4 campus transit buses.",
      reviewerNotes: "Exceptional cross-departmental collaboration between E&TC and Computer Engineering. Tested live prototype during tech symposium. Approved for official college GitHub namespace, cloud deployment credits, and lab access.",
      reviewedBy: profJoshi.name,
      decisionDate: new Date("2026-10-15T14:30:00Z")
    }
  });

  // Application 2: OpenSyllabus -> APPROVED by Dr. Joshi
  await prisma.supportApplication.upsert({
    where: { projectId: syllabusProject.id },
    update: {},
    create: {
      projectId: syllabusProject.id,
      status: "approved",
      problem: "Lack of centralized, verified past exam questions and professor notes across engineering departments.",
      targetAudience: "All 1st-4th year engineering undergraduates preparing for university semester exams.",
      requestedSupport: JSON.stringify(["@college-dev Org Transfer", "$500 Cloud Grants", "Supabase Vector Database Hosting"]),
      risksAndMitigations: "Copyright compliance managed through strict moderation and CC-BY peer contribution guidelines.",
      nextMilestone: "Expand vector indexing to include First Year Basic Electronics and Applied Mathematics.",
      reviewerNotes: "High utility academic tool with great user adoption. Approved for $500 Supabase/Qdrant cloud grant and campus organization hosting.",
      reviewedBy: profJoshi.name,
      decisionDate: new Date("2026-10-18T11:00:00Z")
    }
  });

  // Application 3: Lab Scheduler -> SUBMITTED by Aarav (Ready for review in the Review Desk!)
  await prisma.supportApplication.upsert({
    where: { projectId: labProject.id },
    update: {},
    create: {
      projectId: labProject.id,
      status: "submitted",
      problem: "Physical paper logbooks in robotics Lab 304 cause overlapping reservations, misplaced sensor kits, and lack of accountability.",
      targetAudience: "Faculty instructors and 280+ students utilizing IoT benches and logic analyzers.",
      requestedSupport: JSON.stringify(["Campus Subdomain (labs.isquareit.edu.in)", "Robotics Lab RFID Keycard Integration", "Faculty Advisory Mentorship"]),
      risksAndMitigations: "Hardware keycard reader will operate on local isolated campus LAN with encrypted MQTT tokens.",
      nextMilestone: "Connect ESP32 RFID badge scanner with student database authentication.",
      reviewerNotes: null
    }
  });

  // 5. Seed Project Memberships (Team Roster)
  console.log("👥 Seeding cross-department project memberships...");

  // Rohan's Shuttle Project has Aarav & Ananya as team members
  await prisma.projectMember.upsert({
    where: { projectId_userId: { projectId: shuttleProject.id, userId: rohan.id } },
    update: {},
    create: { projectId: shuttleProject.id, userId: rohan.id, role: "Lead Maintainer" }
  });
  await prisma.projectMember.upsert({
    where: { projectId_userId: { projectId: shuttleProject.id, userId: aarav.id } },
    update: {},
    create: { projectId: shuttleProject.id, userId: aarav.id, role: "Web Fullstack Maintainer" }
  });
  await prisma.projectMember.upsert({
    where: { projectId_userId: { projectId: shuttleProject.id, userId: ananya.id } },
    update: {},
    create: { projectId: shuttleProject.id, userId: ananya.id, role: "UI / Mobile Contributor" }
  });

  // Priya's OpenSyllabus has Priya as Lead
  await prisma.projectMember.upsert({
    where: { projectId_userId: { projectId: syllabusProject.id, userId: priya.id } },
    update: {},
    create: { projectId: syllabusProject.id, userId: priya.id, role: "Lead Maintainer" }
  });

  // 6. Seed Project Tasks & First Issues
  console.log("📋 Seeding beginner-friendly tasks and first issues...");

  const tasksData = [
    {
      projectId: starterProject.id,
      title: "Implement search debounce on student project catalog",
      description: "Optimize project filtering input with 300ms debounce to prevent redundant re-renders on rapid typing.",
      difficulty: "beginner",
      status: "open",
      role: "Frontend",
      suggestedFiles: JSON.stringify(["src/components/ProjectCatalog.tsx", "src/hooks/useDebounce.ts"])
    },
    {
      projectId: starterProject.id,
      title: "Add export-to-PDF button for verified contribution receipts",
      description: "Allow students to download a signed PDF certificate of their merged pull request for resume submissions.",
      difficulty: "intermediate",
      status: "open",
      role: "Fullstack",
      suggestedFiles: JSON.stringify(["src/components/ReceiptModal.tsx", "src/lib/pdfGenerator.ts"])
    },
    {
      projectId: shuttleProject.id,
      title: "Calibrate GPS baud rate on SIM800L module",
      description: "Ensure the hardware serial communication baud rate is stabilized at 9600 to prevent buffer overruns during high vibration.",
      difficulty: "beginner",
      status: "open",
      role: "Hardware / Embedded",
      suggestedFiles: JSON.stringify(["firmware/src/gps_sensor.cpp", "firmware/include/config.h"])
    },
    {
      projectId: shuttleProject.id,
      title: "Add bus arrival countdown widget on dashboard",
      description: "Create an estimated arrival pill with live countdown seconds computed from vehicle velocity vector.",
      difficulty: "beginner",
      status: "in_progress",
      role: "Frontend",
      suggestedFiles: JSON.stringify(["src/components/EtaCard.tsx", "src/hooks/useShuttleStream.ts"])
    },
    {
      projectId: labProject.id,
      title: "Design NFC card reader serial protocol listener",
      description: "Write an endpoint to consume card UID pulses from the lab entrance badge reader over WebSocket.",
      difficulty: "intermediate",
      status: "open",
      role: "Backend",
      suggestedFiles: JSON.stringify(["src/server/nfcReader.ts", "src/pages/api/rfid/tap.ts"])
    },
    {
      projectId: labProject.id,
      title: "Build calendar drag-and-drop slot reservation widget",
      description: "Allow students to view 1-hour time blocks and click or drag to reserve an oscilloscope bench.",
      difficulty: "beginner",
      status: "open",
      role: "Frontend",
      suggestedFiles: JSON.stringify(["src/components/LabCalendar.tsx"])
    },
    {
      projectId: syllabusProject.id,
      title: "Add OCR fallback for handwritten scanned notes",
      description: "Integrate Tesseract OCR worker for PDFs that lack embedded text layers before vectorizing.",
      difficulty: "intermediate",
      status: "open",
      role: "Data Pipeline",
      suggestedFiles: JSON.stringify(["pipelines/ocr_worker.py", "pipelines/embeddings.py"])
    }
  ];

  for (const t of tasksData) {
    const existing = await prisma.projectTask.findFirst({
      where: { projectId: t.projectId, title: t.title }
    });
    if (!existing) {
      await prisma.projectTask.create({ data: t });
    }
  }

  // 7. Seed Collaboration Pitches & Activities
  console.log("🤝 Seeding collaboration requests & interactive desk pitches...");

  // Pitch 1: Ananya -> Aarav's Lab Scheduler (PENDING - Can click Accept/Decline live!)
  let pitch1 = await prisma.collaborationRequest.findFirst({
    where: { projectId: labProject.id, applicantId: ananya.id }
  });
  if (!pitch1) {
    pitch1 = await prisma.collaborationRequest.create({
      data: {
        projectId: labProject.id,
        applicantId: ananya.id,
        role: "Frontend & UI/UX Contributor",
        message: "Hi Aarav! I'm a sophomore in CS. I've designed several mobile dashboards in Figma and would love to build the responsive student reservation calendar and bench availability cards.",
        status: "pending"
      }
    });
    await prisma.collaborationActivity.create({
      data: {
        requestId: pitch1.id,
        actorId: ananya.id,
        action: "pitch.submitted",
        note: "Submitted collaboration pitch with Figma prototype links."
      }
    });
  }

  // Pitch 2: Aarav -> Rohan's Campus Shuttle (ACCEPTED)
  let pitch2 = await prisma.collaborationRequest.findFirst({
    where: { projectId: shuttleProject.id, applicantId: aarav.id }
  });
  if (!pitch2) {
    pitch2 = await prisma.collaborationRequest.create({
      data: {
        projectId: shuttleProject.id,
        applicantId: aarav.id,
        role: "Web Fullstack Maintainer",
        message: "Hey Rohan, I can handle the map visualization layer and live vehicle socket updates using Leaflet and Next.js.",
        status: "accepted"
      }
    });
    await prisma.collaborationActivity.create({
      data: {
        requestId: pitch2.id,
        actorId: rohan.id,
        action: "pitch.accepted",
        note: "Pitch accepted by Rohan Deshmukh. Welcomed to the telemetry core maintainer team."
      }
    });
  }

  // 8. Seed Cryptographically Verified Contributions (Heatmap & Portfolio Proof)
  console.log("🔏 Seeding verified GitHub receipts & contribution proofs...");

  const contributionsData = [
    {
      userId: aarav.id,
      projectId: shuttleProject.id,
      type: "pr_merged",
      title: "PR #12: Optimize spatial query indexing for bus route coordinates",
      repo: "college-dev/campus-ride-telemetry",
      sha: "7f9b1c4e2a10b42c98d7",
      externalUrl: "https://github.com/college-dev/campus-ride-telemetry/pull/12",
      deliveryId: "wh-del-101",
      details: "Added PostGIS spatial bounding-box indexing and reduced GPS query latency by 64% during peak commute hours.",
      verifiedByGitHub: true
    },
    {
      userId: aarav.id,
      projectId: shuttleProject.id,
      type: "commit",
      title: "Wire Leaflet map component with realtime vehicle marker updates",
      repo: "college-dev/campus-ride-telemetry",
      sha: "e4d82a17f9c2019b883a",
      externalUrl: "https://github.com/college-dev/campus-ride-telemetry/commit/e4d82a17",
      deliveryId: "wh-del-102",
      details: "Smooth coordinate interpolation between incoming MQTT telemetry frames to eliminate bus map jumping.",
      verifiedByGitHub: true
    },
    {
      userId: aarav.id,
      projectId: labProject.id,
      type: "issue_resolved",
      title: "Fix CSRF header mismatch on student slot reservation API",
      repo: "aarav-sharma/lab-scheduler-iot",
      sha: "99b2c3d4e5f6071829aa",
      externalUrl: "https://github.com/aarav-sharma/lab-scheduler-iot/commit/99b2c3d4",
      deliveryId: "wh-del-103",
      details: "Standardized SameSite cookies and bearer token authorization across lab gateway microservices.",
      verifiedByGitHub: true
    },
    {
      userId: rohan.id,
      projectId: shuttleProject.id,
      type: "pr_merged",
      title: "PR #18: Configure SIM800L cellular fallback for offline transit routes",
      repo: "college-dev/campus-ride-telemetry",
      sha: "b8c3d2e1f4095a6b7c8d",
      externalUrl: "https://github.com/college-dev/campus-ride-telemetry/pull/18",
      details: "Automatic fallback to SMS payload if 4G/GPRS data signal drops in basement campus terminals.",
      verifiedByGitHub: true
    },
    {
      userId: priya.id,
      projectId: syllabusProject.id,
      type: "pr_merged",
      title: "PR #24: Implement semantic embedding pipeline for SPPU past question papers",
      repo: "college-dev/open-syllabus-i2it",
      sha: "3a8f09d1e2b3c4d5e6f7",
      externalUrl: "https://github.com/college-dev/open-syllabus-i2it/pull/24",
      details: "Chunked 1,400+ previous year exam questions with all-MiniLM-L6-v2 embeddings for instant semantic search.",
      verifiedByGitHub: true
    }
  ];

  for (const c of contributionsData) {
    const existing = await prisma.verifiedContribution.findFirst({
      where: { userId: c.userId, title: c.title }
    });
    if (!existing) {
      await prisma.verifiedContribution.create({ data: c });
    }
  }

  // 9. Seed Notifications for Demo Accounts
  console.log("🔔 Seeding notifications for demo accounts...");

  const notificationsData = [
    {
      userId: aarav.id,
      type: "collaboration_request",
      title: "New Collaboration Pitch",
      body: 'Ananya Kulkarni pitched to collaborate on "IoT Lab Testbench Reservation System" as Frontend & UI/UX Contributor.',
      href: "/dashboard?tab=collab"
    },
    {
      userId: aarav.id,
      type: "collaboration_decision",
      title: "Pitch Accepted!",
      body: 'Rohan Deshmukh accepted your pitch on "Campus Shuttle Live GPS Telemetry". You are now an active team member.',
      href: "/dashboard?tab=catalog"
    },
    {
      userId: aarav.id,
      type: "webhook_verified",
      title: "Verified Contribution Receipt",
      body: "Cryptographically signed receipt generated for PR #12 on college-dev/campus-ride-telemetry.",
      href: "/dashboard?tab=profile"
    },
    {
      userId: ananya.id,
      type: "collaboration_request",
      title: "Pitch Submitted",
      body: 'Your proposal to join "IoT Lab Testbench Reservation System" has been delivered to Aarav Sharma.',
      href: "/dashboard?tab=collab"
    },
    {
      userId: profJoshi.id,
      type: "verification_request",
      title: "Pending PRN Verification",
      body: "Ananya Kulkarni (PRN: 72334005D, SE Computer Eng) has applied for campus verification.",
      href: "/dashboard?tab=admin"
    }
  ];

  for (const n of notificationsData) {
    const existing = await prisma.notification.findFirst({
      where: { userId: n.userId, title: n.title }
    });
    if (!existing) {
      await prisma.notification.create({ data: n });
    }
  }

  // 10. Seed Audit Events
  await prisma.auditEvent.upsert({
    where: { id: "seed-demo-event" },
    update: {},
    create: {
      id: "seed-demo-event",
      actorId: aarav.id,
      action: "development.seeded",
      target: "demo-environment",
      metadata: {
        seededBy: "seed.ts",
        architecture: "ADR-0002 GitHub OAuth + PRN Gate",
        usersCount: seedUsers.length,
        projectsCount: 5,
        platformRepo: "https://github.com/ankitpandey1900/BuildLab_By-I2IT"
      }
    }
  });

  console.log("\n✨ GitHub-first campus community demo data seeded successfully (ADR-0002)!");
  console.log("---------------------------------------------------------------------------------");
  console.log(`Demo Account 1: @aarav-sharma (Student Maintainer · PRN: 72234012A - Verified)`);
  console.log(`Demo Account 2: @priya-patel (Lead AI Maintainer · PRN: 72134045B - Verified)`);
  console.log(`Demo Account 3: @rohan-deshmukh (IoT Club President · PRN: 72234089C - Verified)`);
  console.log(`Demo Account 4: @ananya-kulkarni (Junior Contributor · PRN: 72334005D - PENDING APPROVAL)`);
  console.log(`Demo Account 5: @sanjay-joshi-i2it (Faculty Reviewer · EMP: EMP-CS-104 - Verified)`);
  console.log(`Demo Account 6: @vikram-shinde (Student Applicant · PRN: 72299999X - REJECTED with note)`);
  console.log(`Demo Account 7: @i2it-campus-admin (Lead Administrator · PRN: ADMIN-01 - Verified)`);
  console.log("Auth Provider: GitHub OAuth (accounts seeded with providerId='github', zero passwords)");
  console.log("---------------------------------------------------------------------------------\n");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error("Error during seeding:", error);
    await prisma.$disconnect();
    process.exit(1);
  });
