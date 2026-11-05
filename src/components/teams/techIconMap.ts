// Centralized tech icon mapping
// Uses simple-icons for known technologies/tools and lucide/mdi for generic concepts

export const techIconMap: Record<string, string> = {
  // Technologies (simple-icons)
  react: "simple-icons:react",
  typescript: "simple-icons:typescript",
  ts: "simple-icons:typescript",
  javascript: "simple-icons:javascript",
  js: "simple-icons:javascript",
  html: "simple-icons:html5",
  css: "simple-icons:css3",
  tailwind: "simple-icons:tailwindcss",
  "tailwind css": "simple-icons:tailwindcss",
  nextjs: "simple-icons:nextdotjs",
  "next.js": "simple-icons:nextdotjs",
  vue: "simple-icons:vuedotjs",
  angular: "simple-icons:angular",
  svelte: "simple-icons:svelte",
  python: "simple-icons:python",

  // Backend & Runtime
  node: "simple-icons:nodedotjs",
  "node.js": "simple-icons:nodedotjs",
  express: "simple-icons:express",
  "express.js": "simple-icons:express",
  nestjs: "simple-icons:nestjs",
  fastapi: "simple-icons:fastapi",
  django: "simple-icons:django",
  graphql: "simple-icons:graphql",

  // Databases & ORMs
  postgresql: "simple-icons:postgresql",
  postgres: "simple-icons:postgresql",
  prisma: "simple-icons:prisma",
  "prisma orm": "simple-icons:prisma",
  mongodb: "simple-icons:mongodb",
  redis: "simple-icons:redis",
  mysql: "simple-icons:mysql",
  sqlite: "simple-icons:sqlite",

  // DevOps & Cloud
  docker: "simple-icons:docker",
  kubernetes: "simple-icons:kubernetes",
  git: "simple-icons:git",
  github: "simple-icons:github",
  linux: "simple-icons:linux",
  aws: "simple-icons:amazonaws",
  vercel: "simple-icons:vercel",
  devops: "lucide:git-branch",

  // General concepts (lucide / mdi)
  "web development": "mdi:web",
  "vibe coder": "lucide:flame",
  "pure vibe coder": "lucide:flame",
  "problem solving": "lucide:lightbulb",
  leadership: "lucide:users",
  architecture: "lucide:boxes",
  "backend architecture": "lucide:boxes",
  "component architecture": "lucide:component",
  "frontend integration": "lucide:puzzle",
  "responsive ui": "lucide:smartphone",
  "responsive ui development": "lucide:smartphone",
  "rest apis": "lucide:network",
  api: "lucide:network",
  "api security": "lucide:shield-alert",
  security: "lucide:shield-check",
  "web security": "lucide:shield",
  "oauth 2.0": "lucide:key",
  oauth: "lucide:key",
  "authentication & authorization": "lucide:key-round",
  authentication: "lucide:key-round",
  authorization: "lucide:lock",
  "database design": "lucide:database",
  "database management": "lucide:database",
  database: "lucide:database",

  // AI / Data / Emerging Tech
  "machine learning": "lucide:brain",
  "deep learning": "lucide:layers",
  "artificial intelligence": "lucide:bot",
  ai: "lucide:bot",
  "data science": "lucide:bar-chart-2",
  "data mining": "lucide:binary",
  blockchain: "lucide:blocks",
  "blockchain technology": "lucide:blocks",
  iot: "lucide:wifi",
  "image processing": "lucide:image",
  "video processing": "lucide:video",
  "pattern recognition": "lucide:scan",
  "information theory": "lucide:binary",
  "error control coding": "lucide:shield-check",

  // Networks & Systems & Geo
  "control system": "lucide:sliders",
  "computer network": "lucide:network",
  network: "lucide:network",
  gnss: "lucide:satellite",
  "space weather": "lucide:sun",
  "web gis": "lucide:globe",
  "web geographic information system": "lucide:globe",
  "remote sensing": "lucide:satellite",
  "urban planning": "lucide:building-2",
  agriculture: "lucide:sprout",
};

export function getTechIcon(name: string): string {
  const normalized = name.toLowerCase().trim();

  // Direct match
  if (techIconMap[normalized]) {
    return techIconMap[normalized];
  }

  // Substring match
  const foundKey = Object.keys(techIconMap).find((k) =>
    normalized.includes(k) || k.includes(normalized)
  );
  if (foundKey) {
    return techIconMap[foundKey];
  }

  return "lucide:code-2";
}

export function getTechColor(name: string): string {
  const s = name.toLowerCase().trim();

  if (s.includes("react")) return "text-sky-400";
  if (s.includes("typescript") || s.includes("ts")) return "text-blue-400";
  if (s.includes("tailwind") || s.includes("css")) return "text-cyan-400";
  if (s.includes("node")) return "text-emerald-400";
  if (s.includes("express")) return "text-amber-400";
  if (s.includes("postgres") || s.includes("prisma")) return "text-indigo-400";
  if (s.includes("vibe") || s.includes("flame")) return "text-orange-400";
  if (s.includes("devop") || s.includes("docker") || s.includes("git")) return "text-purple-400";
  if (s.includes("security") || s.includes("auth") || s.includes("oauth")) return "text-rose-400";
  if (s.includes("ai") || s.includes("learning") || s.includes("intelligence")) return "text-fuchsia-400";
  if (s.includes("blockchain")) return "text-amber-400";
  if (s.includes("network") || s.includes("web") || s.includes("api")) return "text-sky-400";
  if (s.includes("iot") || s.includes("control") || s.includes("agriculture")) return "text-emerald-400";

  return "text-[var(--text-secondary)]";
}

