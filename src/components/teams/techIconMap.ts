// Centralized tech icon mapping
// Uses simple-icons for known technologies/tools and lucide/mdi for generic concepts

export const techIconMap: Record<string, string> = {
  // Frontend & Languages (simple-icons)
  react: "simple-icons:react",
  "react 19": "simple-icons:react",
  reactjs: "simple-icons:react",
  "react native": "simple-icons:react",
  typescript: "simple-icons:typescript",
  ts: "simple-icons:typescript",
  javascript: "simple-icons:javascript",
  js: "simple-icons:javascript",
  html: "simple-icons:html5",
  html5: "simple-icons:html5",
  css: "simple-icons:css3",
  css3: "simple-icons:css3",
  tailwind: "simple-icons:tailwindcss",
  "tailwind css": "simple-icons:tailwindcss",
  tailwindcss: "simple-icons:tailwindcss",
  nextjs: "simple-icons:nextdotjs",
  "next.js": "simple-icons:nextdotjs",
  "next.js 15": "simple-icons:nextdotjs",
  next: "simple-icons:nextdotjs",
  vue: "simple-icons:vuedotjs",
  vuejs: "simple-icons:vuedotjs",
  angular: "simple-icons:angular",
  svelte: "simple-icons:svelte",
  python: "simple-icons:python",
  vite: "simple-icons:vite",
  leaflet: "simple-icons:leaflet",
  d3: "simple-icons:d3dotjs",
  "d3.js": "simple-icons:d3dotjs",
  "framer motion": "simple-icons:framer",
  framer: "simple-icons:framer",
  figma: "simple-icons:figma",

  // Native & Systems Languages
  "c++": "simple-icons:cplusplus",
  cpp: "simple-icons:cplusplus",
  c: "simple-icons:c",
  go: "simple-icons:go",
  golang: "simple-icons:go",
  rust: "simple-icons:rust",
  java: "simple-icons:openjdk",
  kotlin: "simple-icons:kotlin",
  swift: "simple-icons:swift",
  dart: "simple-icons:dart",
  flutter: "simple-icons:flutter",
  webassembly: "simple-icons:webassembly",
  wasm: "simple-icons:webassembly",

  // Backend & Runtime
  node: "simple-icons:nodedotjs",
  "node.js": "simple-icons:nodedotjs",
  nodejs: "simple-icons:nodedotjs",
  express: "simple-icons:express",
  "express.js": "simple-icons:express",
  nestjs: "simple-icons:nestjs",
  fastapi: "simple-icons:fastapi",
  django: "simple-icons:django",
  flask: "simple-icons:flask",
  graphql: "simple-icons:graphql",

  // Databases & ORMs
  postgresql: "simple-icons:postgresql",
  postgres: "simple-icons:postgresql",
  psql: "simple-icons:postgresql",
  prisma: "simple-icons:prisma",
  "prisma orm": "simple-icons:prisma",
  mongodb: "simple-icons:mongodb",
  mongo: "simple-icons:mongodb",
  redis: "simple-icons:redis",
  mysql: "simple-icons:mysql",
  sqlite: "simple-icons:sqlite",
  supabase: "simple-icons:supabase",
  qdrant: "simple-icons:qdrant",

  // DevOps & Cloud & Hardware
  docker: "simple-icons:docker",
  "docker compose": "simple-icons:docker",
  kubernetes: "simple-icons:kubernetes",
  k8s: "simple-icons:kubernetes",
  git: "simple-icons:git",
  github: "simple-icons:github",
  gitlab: "simple-icons:gitlab",
  linkedin: "simple-icons:linkedin",
  linux: "simple-icons:linux",
  aws: "simple-icons:amazonaws",
  vercel: "simple-icons:vercel",
  firebase: "simple-icons:firebase",
  devops: "lucide:git-branch",
  esp32: "simple-icons:espressif",
  esp8266: "simple-icons:espressif",
  arduino: "simple-icons:arduino",
  "raspberry pi": "simple-icons:raspberrypi",
  raspberry: "simple-icons:raspberrypi",
  mqtt: "simple-icons:eclipsemosquitto",
  matlab: "simple-icons:mathworks",
  freertos: "lucide:cpu",
  "pcb design": "lucide:circuit-board",
  telemetry: "lucide:activity",
  hardware: "lucide:cpu",
  embedded: "lucide:cpu",
  websocket: "lucide:radio",
  websockets: "lucide:radio",
  ws: "lucide:radio",

  // AI & Machine Learning
  pytorch: "simple-icons:pytorch",
  tensorflow: "simple-icons:tensorflow",
  "machine learning": "lucide:brain",
  "deep learning": "lucide:layers",
  "artificial intelligence": "lucide:bot",
  ai: "lucide:bot",
  "data science": "lucide:bar-chart-2",
  "data mining": "lucide:binary",
  "computer vision": "lucide:eye",
  nlp: "lucide:message-square-code",
  "image processing": "lucide:image",
  "video processing": "lucide:video",
  "pattern recognition": "lucide:scan",
  "information theory": "lucide:binary",
  "error control coding": "lucide:shield-check",

  // General concepts (lucide / mdi)
  "web development": "mdi:web",
  "vibe coder": "lucide:flame",
  "pure vibe coder": "lucide:flame",
  "problem solving": "lucide:lightbulb",
  leadership: "lucide:users",
  architecture: "lucide:boxes",
  "system architecture": "lucide:boxes",
  "backend architecture": "lucide:boxes",
  "component architecture": "lucide:component",
  "frontend integration": "lucide:puzzle",
  "distributed systems": "lucide:network",
  "responsive ui": "lucide:smartphone",
  "responsive ui development": "lucide:smartphone",
  "rest apis": "lucide:network",
  api: "lucide:network",
  "api security": "lucide:shield-alert",
  "cloud security": "lucide:shield-check",
  security: "lucide:shield-check",
  "web security": "lucide:shield",
  "oauth 2.0": "lucide:key",
  oauth: "lucide:key",
  "authentication & authorization": "lucide:key-round",
  authentication: "lucide:key-round",
  authorization: "lucide:lock",
  auth: "lucide:lock",
  jwt: "lucide:key",
  "database design": "lucide:database",
  "database management": "lucide:database",
  database: "lucide:database",
  blockchain: "lucide:blocks",
  "blockchain technology": "lucide:blocks",
  iot: "lucide:wifi",
  "open source": "lucide:globe",
  "academic research": "lucide:graduation-cap",
  administration: "lucide:shield-alert",
  "campus governance": "lucide:building",
  "code auditing": "lucide:file-check",
  mail: "lucide:mail",
  email: "lucide:mail",
  portfolio: "lucide:globe",
  website: "lucide:globe",

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

  // Sort keys by descending length to match longest prefix first
  const keys = Object.keys(techIconMap).sort((a, b) => b.length - a.length);
  for (const k of keys) {
    if (normalized.includes(k) || k.includes(normalized)) {
      return techIconMap[k];
    }
  }

  return "lucide:code-2";
}

export function getTechColor(name: string): string {
  const s = name.toLowerCase().trim();

  if (s.includes("react")) return "text-sky-400";
  if (s.includes("typescript") || s.includes("ts")) return "text-blue-400";
  if (s.includes("javascript") || s.includes("js")) return "text-yellow-400";
  if (s.includes("tailwind") || s.includes("css")) return "text-cyan-400";
  if (s.includes("next")) return "text-zinc-200";
  if (s.includes("node")) return "text-emerald-400";
  if (s.includes("express")) return "text-amber-400";
  if (s.includes("postgres") || s.includes("prisma")) return "text-indigo-400";
  if (s.includes("python")) return "text-yellow-400";
  if (s.includes("rust")) return "text-orange-400";
  if (s.includes("c++") || s.includes("cpp")) return "text-blue-500";
  if (s.includes("go") || s.includes("golang")) return "text-cyan-400";
  if (s.includes("java")) return "text-red-400";
  if (s.includes("kotlin")) return "text-purple-400";
  if (s.includes("swift")) return "text-orange-500";
  if (s.includes("flutter") || s.includes("dart")) return "text-sky-400";
  if (s.includes("vibe") || s.includes("flame")) return "text-orange-400";
  if (s.includes("docker") || s.includes("kubernetes")) return "text-blue-400";
  if (s.includes("devop") || s.includes("git")) return "text-purple-400";
  if (s.includes("security") || s.includes("auth") || s.includes("oauth")) return "text-rose-400";
  if (s.includes("ai") || s.includes("learning") || s.includes("intelligence") || s.includes("pytorch")) return "text-fuchsia-400";
  if (s.includes("blockchain")) return "text-amber-400";
  if (s.includes("network") || s.includes("web") || s.includes("api")) return "text-sky-400";
  if (s.includes("iot") || s.includes("esp") || s.includes("arduino") || s.includes("control") || s.includes("agriculture")) return "text-emerald-400";
  if (s.includes("figma")) return "text-pink-400";
  if (s.includes("supabase")) return "text-emerald-400";
  if (s.includes("redis")) return "text-red-400";

  return "text-[var(--text-secondary)]";
}
