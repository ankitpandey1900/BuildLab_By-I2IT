import { PrismaClient } from "@prisma/client";
import { auth } from "../src/lib/auth";

const prisma = new PrismaClient();
const collegeDomain = process.env.COLLEGE_EMAIL_DOMAIN ?? "i2it.ac.in";

// Ensure seed can execute in demo mode
process.env.ALLOW_DEMO_SEED = "true";

interface SeedUserData {
  name: string;
  email: string;
  password: string;
  role: string;
  bio: string;
  branchYear: string;
  skills: string[];
  interests: string[];
  availability: number;
  image: string;
}

const seedUsers: SeedUserData[] = [
  {
    name: "Aarav Sharma",
    email: `aarav.sharma@${collegeDomain}`,
    password: "I2ITDemo!2026",
    role: "student",
    bio: "Junior CS student passionate about distributed systems, Rust, and building open-source tools for campus infrastructure.",
    branchYear: "Computer Engineering · 2026",
    skills: ["TypeScript", "React", "PostgreSQL", "Next.js", "Docker"],
    interests: ["Open Source", "Distributed Systems", "Campus Tools"],
    availability: 8,
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
  },
  {
    name: "Priya Patel",
    email: `priya.patel@${collegeDomain}`,
    password: "I2ITDemo!2026",
    role: "student",
    bio: "Final year IT engineer working on local LLMs, vector search, and academic information systems.",
    branchYear: "Information Technology · 2025",
    skills: ["Python", "FastAPI", "React", "Qdrant", "PostgreSQL", "PyTorch"],
    interests: ["AI/ML", "Information Retrieval", "Education Tech"],
    availability: 12,
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80"
  },
  {
    name: "Rohan Deshmukh",
    email: `rohan.deshmukh@${collegeDomain}`,
    password: "I2ITDemo!2026",
    role: "student",
    bio: "Hardware hacker, embedded developer, and president of Campus Robotics & IoT Club.",
    branchYear: "Electronics & Telecommunication · 2026",
    skills: ["C++", "ESP32", "MQTT", "FreeRTOS", "PCB Design", "Next.js"],
    interests: ["IoT", "Robotics", "Embedded Linux", "Firmware"],
    availability: 10,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
  },
  {
    name: "Ananya Kulkarni",
    email: `ananya.kulkarni@${collegeDomain}`,
    password: "I2ITDemo!2026",
    role: "student",
    bio: "Sophomore developer interested in competitive programming, data structures, and intuitive developer interfaces.",
    branchYear: "Computer Engineering · 2027",
    skills: ["TypeScript", "Tailwind CSS", "Rust", "Figma", "WebAssembly"],
    interests: ["Competitive Programming", "UI/UX", "Rust Systems"],
    availability: 6,
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80"
  },
  {
    name: "Dr. Sanjay Joshi",
    email: `sanjay.joshi@${collegeDomain}`,
    password: "I2ITDemo!2026",
    role: "faculty",
    bio: "Associate Professor & Faculty Advisor for Open Source & Student Research Incubations at I2IT.",
    branchYear: "Department of Computer Engineering",
    skills: ["System Architecture", "Cloud Security", "Distributed Systems", "Academic Research"],
    interests: ["Open Source Governance", "Institutional Grants", "Student Mentorship"],
    availability: 4,
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80"
  }
];

async function getOrCreateUser(data: SeedUserData) {
  let user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user) {
    try {
      const result = await auth.api.signUpEmail({
        body: {
          name: data.name,
          email: data.email,
          password: data.password
        }
      });
      user = await prisma.user.findUnique({ where: { id: result.user.id } });
    } catch {
      // If Better Auth user existed without DB record
      user = await prisma.user.findUnique({ where: { email: data.email } });
    }
  }

  if (user) {
    user = await (prisma.user as any).update({
      where: { id: user.id },
      data: {
        name: data.name,
        emailVerified: true,
        verificationStatus: "VERIFIED",
        department: data.branchYear.split("·")[0]?.trim() || "Computer Engineering",
        academicYear: data.branchYear.split("·")[1]?.trim() || "2026",
        role: data.role,
        bio: data.bio,
        branchYear: data.branchYear,
        skills: JSON.stringify(data.skills),
        interests: JSON.stringify(data.interests),
        availability: data.availability,
        image: data.image
      }
    });
  }

  return user;
}

async function main() {
  console.log("🌱 Starting comprehensive campus community seed...");

  // 1. Seed All 5 Users
  const userMap: Record<string, any> = {};
  for (const uData of seedUsers) {
    const user = await getOrCreateUser(uData);
    if (user) {
      userMap[uData.email.split("@")[0]] = user;
      console.log(`✓ User ready: ${user.name} (${user.email}) [${uData.role}]`);
    }
  }

  const aarav = userMap["aarav.sharma"];
  const priya = userMap["priya.patel"];
  const rohan = userMap["rohan.deshmukh"];
  const ananya = userMap["ananya.kulkarni"];
  const profJoshi = userMap["sanjay.joshi"];

  if (!aarav || !priya || !rohan || !ananya || !profJoshi) {
    throw new Error("Failed to initialize all required demo accounts.");
  }

  // 2. Seed Projects Across Different Tracks & Maturities
  console.log("📦 Seeding campus repositories...");

  // Project A: I2IT Community Starter (Aarav)
  await prisma.project.upsert({
    where: { slug: "i2it-community-starter" },
    update: { ownerId: aarav.id },
    create: {
      ownerId: aarav.id,
      name: "I2IT Community Starter Project",
      slug: "i2it-community-starter",
      summary: "A seeded template repository for onboarding new campus developers, exploring code reviews, and testing webhook synchronization.",
      problemStatement: "New engineering students often struggle to find safe, sandbox repositories to make their first pull requests without intimidation.",
      status: "active",
      maturity: "active",
      visibility: "college",
      skills: JSON.stringify(["TypeScript", "React", "PostgreSQL", "Tailwind CSS"]),
      teamNeeds: JSON.stringify(["Frontend Contributor", "Documentation Reviewer"]),
      repositoryUrl: "https://github.com/aarav-sharma/i2it-community-starter",
      license: "MIT",
      contributionGuide: "Fork the repository, create a branch from main, and open a pull request with unit tests."
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
      skills: JSON.stringify(["C++", "ESP32", "MQTT", "Next.js", "PostgreSQL", "Leaflet"]),
      teamNeeds: JSON.stringify(["Fullstack Maintainer", "Embedded Firmware Hacker", "Mobile App Dev"]),
      repositoryUrl: "https://github.com/college-dev/campus-ride-telemetry",
      license: "Apache-2.0",
      contributionGuide: "Follow the hardware setup schematic in /docs/hardware.md. Firmware builds using PlatformIO."
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
      skills: JSON.stringify(["Python", "FastAPI", "React", "Qdrant", "PostgreSQL", "Docker"]),
      teamNeeds: JSON.stringify(["Data Pipeline Contributor", "Vector Search Engineer"]),
      repositoryUrl: "https://github.com/college-dev/open-syllabus-i2it",
      license: "MIT",
      contributionGuide: "Run docker compose up to spin up the local Qdrant vector database and FastAPI server."
    }
  });

  // Project D: IoT Lab Equipment Reservation (Aarav) - Independent with SUBMITTED Application (Perfect for Demoing Review Desk!)
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
      skills: JSON.stringify(["Rust", "WebAssembly", "TypeScript", "Tailwind CSS"]),
      teamNeeds: JSON.stringify(["Algorithm Content Contributor", "Rust WebAssembly Dev"]),
      repositoryUrl: "https://github.com/ananya-k/gate-prep-tracker",
      license: "MIT"
    }
  });

  // 3. Seed Support Applications & Decisions
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

  // Application 3: Lab Scheduler -> SUBMITTED by Aarav (Ready for live demonstration on Review Desk!)
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

  // 4. Seed Project Memberships (Team Roster)
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

  // 5. Seed Project Tasks & First Issues
  console.log("📋 Seeding beginner-friendly tasks and first issues...");

  const tasksData = [
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

  // 6. Seed Collaboration Pitches & Activities
  console.log("🤝 Seeding collaboration requests & interactive desk pitches...");

  // Pitch 1: Ananya -> Aarav's Lab Scheduler (PENDING - Teacher can click Accept/Decline live!)
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

  // 7. Seed Cryptographically Verified Contributions (Heatmap & Portfolio Proof)
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

  // 8. Seed Notifications for Aarav (Live Bell Demo)
  console.log("🔔 Seeding notifications for demo account...");

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

  // 9. Seed Audit Events
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
        usersCount: seedUsers.length,
        projectsCount: 5
      }
    }
  });

  console.log("\n✨ Comprehensive campus community demo data seeded successfully!");
  console.log("----------------------------------------------------------------");
  console.log(`Demo Account 1: aarav.sharma@${collegeDomain} (Student Maintainer)`);
  console.log(`Demo Account 2: priya.patel@${collegeDomain} (Lead AI Maintainer)`);
  console.log(`Demo Account 3: rohan.deshmukh@${collegeDomain} (IoT Club President)`);
  console.log(`Demo Account 4: ananya.kulkarni@${collegeDomain} (Junior Contributor)`);
  console.log(`Demo Account 5: sanjay.joshi@${collegeDomain} (Faculty Reviewer)`);
  console.log(`Password for all accounts: I2ITDemo!2026`);
  console.log("----------------------------------------------------------------\n");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error("Error during seeding:", error);
    await prisma.$disconnect();
    process.exit(1);
  });
