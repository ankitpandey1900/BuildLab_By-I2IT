import React from 'react';
import { 
  Radio, 
  BarChart3, 
  Cpu, 
  Activity, 
  Code2,
  Cloud,
  Lock
} from 'lucide-react';

interface TechBadgeProps {
  name: string;
  className?: string;
  size?: 'sm' | 'md';
}

// Crisp SVGs for official tech branding (matching official Microsoft TypeScript brand specs)
const TypeScriptIcon: React.FC<{ size?: number; className?: string }> = ({ size = 12, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect width="24" height="24" rx="3.5" fill="#3178C6" />
    <path
      fill="#FFFFFF"
      d="M6.638 9.75h8.625v2.463H12.6v11.787H9.288V12.213H6.638V9.75zm11.85 0c.612 0 1.154.037 1.661.111a6.7 6.7 0 0 1 1.612.438v2.613a7.3 7.3 0 0 0-1.525-.562 7.7 7.7 0 0 0-1.748-.2c-.93 0-1.637.245-2.123.736-.485.49-.728 1.144-.728 1.961 0 .736.216 1.341.648 1.815.433.473 1.05.867 1.852 1.182l1.087.424c1.23.48 2.148 1.144 2.753 1.993.606.848.908 1.905.908 3.17 0 1.69-.57 3.013-1.71 3.97-1.14 1.057-2.73 1.436-4.77 1.436-1.077 0-2.148-.124-3.212-.372a11.5 11.5 0 0 1-2.903-1.055v-2.887c.942.596 1.983 1.042 3.125 1.337a11.1 11.1 0 0 0 2.84.444c1.066 0 1.874-.26 2.423-.78.55-.52.825-1.22.825-2.1 0-.766-.233-1.39-.7-1.873-.466-.483-1.137-.887-2.012-1.212l-1.075-.411c-1.192-.458-2.074-1.096-2.646-1.913-.572-.818-.858-1.839-.858-3.063 0-1.616.564-2.887 1.692-3.813 1.128-.925 2.67-1.388 4.626-1.388z"
    />
  </svg>
);

const ReactIcon: React.FC<{ size?: number; className?: string }> = ({ size = 12, className = "" }) => (
  <svg width={size} height={size} viewBox="-11.5 -10.2 23 20.4" fill="none" className={className}>
    <circle cx="0" cy="0" r="2.05" fill="#61dafb" />
    <g stroke="#61dafb" strokeWidth="1" fill="none">
      <ellipse rx="11" ry="4.2" />
      <ellipse rx="11" ry="4.2" transform="rotate(60)" />
      <ellipse rx="11" ry="4.2" transform="rotate(120)" />
    </g>
  </svg>
);

const NextIcon: React.FC<{ size?: number; className?: string }> = ({ size = 12, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="11" fill="currentColor" />
    <path d="M16.5 17.5L8.5 7.5h-1.5v9h1.5v-6.5l7 8.2c.4-.2.7-.4 1-.7z" fill="var(--bg-canvas, #000)" />
    <path d="M14.5 7.5h1.5v6.5h-1.5z" fill="var(--bg-canvas, #000)" />
  </svg>
);

const PythonIcon: React.FC<{ size?: number; className?: string }> = ({ size = 12, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 110 110" fill="currentColor" className={className}>
    <path fill="#3776AB" d="M54.5 5.5c-26.6 0-25 11.5-25 11.5l.03 11.9h25.4v3.6H17.8C6.6 32.5 0 45.4 0 54.7c0 10.8 9.4 22 20.9 22h7.6v-10.7c0-12.3 10.5-12.3 10.5-12.3h24.8c9.8 0 17.4-7.4 17.4-17.2V17s1.8-11.5-26.7-11.5zm-14.4 7.6a3.7 3.7 0 110 7.4 3.7 3.7 0 010-7.4z"/>
    <path fill="#FFD43B" d="M55.5 104.5c26.6 0 25-11.5 25-11.5l-.03-11.9H55.07v-3.6h37.13c11.2 0 17.8-12.9 17.8-22.2 0-10.8-9.4-22-20.9-22h-7.6v10.7c0 12.3-10.5 12.3-10.5 12.3H46.2c-9.8 0-17.4 7.4-17.4 17.2V93s-1.8 11.5 26.7 11.5zm14.4-7.6a3.7 3.7 0 110-7.4 3.7 3.7 0 010-7.4z"/>
  </svg>
);

const PostgresIcon: React.FC<{ size?: number; className?: string }> = ({ size = 12, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <ellipse cx="12" cy="7" rx="8" ry="3" fill="#336791" fillOpacity="0.3" stroke="#336791" />
    <path d="M4 7v10c0 1.66 3.58 3 8 3s8-1.34 8-3V7" stroke="#336791" />
    <path d="M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3" stroke="#336791" />
  </svg>
);

const DockerIcon: React.FC<{ size?: number; className?: string }> = ({ size = 12, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#0db7ed" className={className}>
    <path d="M13.983 11.078h2.119a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.119a.185.185 0 00-.185.185v1.888c0 .102.083.185.185.185m-2.954-5.43h2.118a.186.186 0 00.186-.186V3.574a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.186.185.186zm0 2.715h2.118a.186.186 0 00.186-.186V6.289a.186.186 0 00-.186-.186h-2.118a.185.185 0 00-.185.186v1.888c0 .102.082.186.185.186zm-2.953 0h2.118a.186.186 0 00.186-.186V6.289a.186.186 0 00-.186-.186H8.076a.185.185 0 00-.185.186v1.888c0 .102.082.186.185.186zm0 2.715h2.118a.186.186 0 00.186-.186V9.006a.186.186 0 00-.186-.186H8.076a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m-2.954 0h2.119a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186H5.122a.185.185 0 00-.185.185v1.888c0 .102.083.185.185.185m-2.954 0h2.119a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186H2.168a.186.186 0 00-.186.185v1.888c0 .102.083.185.186.185m16.535-3.693c-.48-.352-1.28-.42-1.92-.19-.48.172-.88.544-1.12.984h-4.437V7.18a.185.185 0 00-.185-.185h-2.119a.185.185 0 00-.185.185v1.077h-5.91a.186.186 0 00-.185.186v.737c0 .102.083.186.185.186h15.932c.16.896.64 1.632 1.44 2.08.32.176.64.288 1.04.32.56.048 1.12-.08 1.6-.368.4-.24.72-.592.88-1.024.16-.432.16-.912 0-1.344-.16-.432-.48-.784-.88-1.024z"/>
    <path d="M23.987 11.834c-.112-.08-.336-.16-.576-.144-.64.048-1.2.368-1.52.88-.16.256-.24.56-.24.88 0 .16.032.32.08.48-1.04-.08-2.08.32-2.8 1.04-.64.64-.96 1.52-.88 2.4-.96-.4-2.08-.4-3.04.08-.64.32-1.12.88-1.36 1.52-.8-.24-1.68-.16-2.4.24-.56.32-.96.8-1.2 1.36-.64-.24-1.36-.24-2 .08-.56.32-.96.8-1.2 1.36-.64-.24-1.36-.24-2 .08-.56.32-.96.8-1.2 1.36-.4-.16-.8-.24-1.2-.24-.8 0-1.6.32-2.16.88C.475 22.418 0 23.17 0 24h24c0-.784-.448-1.488-1.12-1.84.32-.48.48-1.04.48-1.6 0-.8-.4-1.52-1.04-1.92.48-.48.72-1.12.72-1.76 0-.56-.24-1.12-.64-1.52.48-.4.72-.96.72-1.6 0-.64-.24-1.28-.72-1.68.48-.32.72-.8.72-1.36 0-.64-.4-1.28-1.145-1.606z"/>
  </svg>
);

const TailwindIcon: React.FC<{ size?: number; className?: string }> = ({ size = 12, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#38bdf8" className={className}>
    <path d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.336 6.182 14.975 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624 1.177 1.194 2.538 2.576 5.512 2.576 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.336 13.382 8.975 12 6.001 12z"/>
  </svg>
);

const LeafletIcon: React.FC<{ size?: number; className?: string }> = ({ size = 12, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#199900" className={className}>
    <path d="M12.003 2.001c-6.627 0-12 5.373-12 12 0 3.314 1.343 6.314 3.515 8.485l8.485-8.485 8.485 8.485c2.172-2.171 3.515-5.171 3.515-8.485 0-6.627-5.373-12-12-12zm-3.5 6.5c1.933 0 3.5 1.567 3.5 3.5s-1.567 3.5-3.5 3.5-3.5-1.567-3.5-3.5 1.567-3.5 3.5-3.5z"/>
  </svg>
);

const NodeIcon: React.FC<{ size?: number; className?: string }> = ({ size = 12, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#68a063" className={className}>
    <path d="M12 2l9 5.2v10.4L12 22.8 3 17.6V7.2L12 2zm0 2.3L4.8 8.5v7l7.2 4.2 7.2-4.2v-7L12 4.3z"/>
  </svg>
);

const ViteIcon: React.FC<{ size?: number; className?: string }> = ({ size = 12, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M21.5 3.5l-9.5 17-2.5-5.5-5.5 1.5L21.5 3.5z" fill="#bd34fe" />
    <path d="M13.5 2.5L3.5 11.5l6 1-1.5 6.5 8-10.5h-5.5l3-6z" fill="#ffd53d" />
  </svg>
);

const CppIcon: React.FC<{ size?: number; className?: string }> = ({ size = 12, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 2L2.5 7.5v9L12 22l9.5-5.5v-9L12 2z" fill="#00599C" />
    <path d="M12 4.2L4.5 8.5v7l7.5 4.3 7.5-4.3v-7L12 4.2z" fill="#004482" />
    <path d="M10.5 14.2c-.7.6-1.6.9-2.5.9-2 0-3.5-1.4-3.5-3.4 0-1.9 1.5-3.4 3.5-3.4.9 0 1.8.3 2.5.9l-.8 1c-.4-.4-1-.7-1.7-.7-1.2 0-2.1.9-2.1 2.2 0 1.3.9 2.2 2.1 2.2.7 0 1.3-.3 1.7-.7l.8 1zm2.7-1.7h.9v-.9h.9v.9h.9v.9h-.9v.9h-.9v-.9h-.9v-.9zm3.8 0h.9v-.9h.9v.9h.9v.9h-.9v.9h-.9v-.9h-.9v-.9z" fill="#FFFFFF" />
  </svg>
);

const Esp32Icon: React.FC<{ size?: number; className?: string }> = ({ size = 12, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="4" y="4" width="16" height="16" rx="2" fill="#E7352C" />
    <rect x="6.5" y="6.5" width="11" height="11" rx="1.5" fill="#18181b" />
    <path d="M1 8h3M1 12h3M1 16h3M20 8h3M20 12h3M20 16h3M8 1v3M12 1v3M16 1v3M8 20v3M12 20v3M16 20v3" stroke="#E7352C" strokeWidth="1.5" strokeLinecap="round" />
    <text x="12" y="13.2" fill="#FFFFFF" fontSize="4.2" fontWeight="900" textAnchor="middle" fontFamily="monospace">ESP</text>
  </svg>
);

const MqttIcon: React.FC<{ size?: number; className?: string }> = ({ size = 12, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="5.5" cy="18.5" r="2.2" fill="#c026d3" />
    <path d="M4 12a9 9 0 0 1 9 9" stroke="#c026d3" strokeWidth="2" strokeLinecap="round" />
    <path d="M4 6a15 15 0 0 1 15 15" stroke="#9333ea" strokeWidth="2.2" strokeLinecap="round" />
  </svg>
);

const GoIcon: React.FC<{ size?: number; className?: string }> = ({ size = 12, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M1.5 11.5c0-3.3 2.5-6 6-6 3.8 0 5.8 2.3 5.8 5.6h-5.4c0 1.4.8 2.4 2.3 2.4 1.1 0 1.9-.4 2.5-1l1.5 1.5c-1.1 1.2-2.5 1.8-4 1.8-3.4 0-6.2-2.3-6.2-5.7zm6-2c-1.4 0-2.2.8-2.3 1.9h4.3c0-1.1-.7-1.9-2-1.9zm8.5-3.8h2v10.5h-2V5.7zm4 4.5c0-2.6 1.6-4.5 3.5-4.5v2c-1 0-1.7.7-1.7 2.2s.7 2.2 1.7 2.2v2c-1.9 0-3.5-1.9-3.5-4.4z" fill="#00ADD8" />
  </svg>
);

const RustIcon: React.FC<{ size?: number; className?: string }> = ({ size = 12, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="10" stroke="#DEA584" strokeWidth="1.8" />
    <path d="M9 16.5V7.5h3.8c1.8 0 2.8.9 2.8 2.3 0 1.1-.7 1.8-1.7 2.1l2 4.6h-1.9l-1.8-4.2H10.6v4.2H9zm1.6-5.8h2c.8 0 1.3-.4 1.3-1s-.5-1-1.3-1h-2v2z" fill="#DEA584" />
  </svg>
);

const PyTorchIcon: React.FC<{ size?: number; className?: string }> = ({ size = 12, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M13.2 2.5l-.8.8 3.5 3.5.8-.8-3.5-3.5zM12 6a6 6 0 106 6h-2a4 4 0 11-4-4V6z" fill="#EE4C2C" />
    <circle cx="16.5" cy="4" r="1.2" fill="#EE4C2C" />
  </svg>
);

const FastApiIcon: React.FC<{ size?: number; className?: string }> = ({ size = 12, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="11" fill="#059669" />
    <path d="M13 3.5L6.5 13h5l-1.5 7.5L17.5 11h-5l1.5-7.5z" fill="#FFFFFF" />
  </svg>
);

const GraphQLIcon: React.FC<{ size?: number; className?: string }> = ({ size = 12, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 2L3.5 7v10l8.5 5 8.5-5V7L12 2zm0 2.5L18.7 8v8L12 19.9 5.3 16V8L12 4.5z" fill="#E10098" />
    <circle cx="12" cy="2" r="1.8" fill="#E10098" />
    <circle cx="3.5" cy="7" r="1.8" fill="#E10098" />
    <circle cx="20.5" cy="7" r="1.8" fill="#E10098" />
    <circle cx="3.5" cy="17" r="1.8" fill="#E10098" />
    <circle cx="20.5" cy="17" r="1.8" fill="#E10098" />
    <circle cx="12" cy="22" r="1.8" fill="#E10098" />
  </svg>
);

const SupabaseIcon: React.FC<{ size?: number; className?: string }> = ({ size = 12, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12.9 2.1c-.5-.7-1.6-.4-1.7.5L9.8 12.3h10.4c.9 0 1.4 1.1.7 1.7L9.4 22.9c-.6.6-1.6.3-1.7-.6l1.4-9.8H1.3c-.9 0-1.4-1.1-.7-1.7L12.9 2.1z" fill="#3ECF8E" />
  </svg>
);

const PrismaIcon: React.FC<{ size?: number; className?: string }> = ({ size = 12, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 2L3 21h18L12 2zm0 4.8l5.2 12.2H6.8L12 6.8z" fill="#5A67D8" />
  </svg>
);

const FlutterIcon: React.FC<{ size?: number; className?: string }> = ({ size = 12, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M14.5 2L4 12.5l3.2 3.2L19.5 3.5h-5z" fill="#54C5F8" />
    <path d="M14.5 13.5l-5.3 5.3 3.2 3.2 5.3-5.3-3.2-3.2z" fill="#01579B" />
    <path d="M9.2 18.8l3.2-3.2 3.2 3.2-3.2 3.2-3.2-3.2z" fill="#29B6F6" />
  </svg>
);

const SwiftIcon: React.FC<{ size?: number; className?: string }> = ({ size = 12, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M20.5 15.8c-2.3 2.7-5.9 4.3-9.5 4.3-5.1 0-8.9-3.3-8.9-3.3s4.1 1.3 7.6-.5c3.5-1.7 5.5-4.7 5.5-4.7s-3.4 1.5-6.6.3c-3.2-1.2-5.2-3.9-5.2-3.9s4.4 2.1 8.2.5c3.9-1.7 6-5 6-5s-2 2.4-5 3.1c3.7-3.1 5-7 5-7s.5 4.7 2.9 7.8c2.4 3.1 6.3 4.9 6.3 4.9s-2.9-1.2-4.3-2.5z" fill="#F05138" />
  </svg>
);

const KotlinIcon: React.FC<{ size?: number; className?: string }> = ({ size = 12, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M22 2H2v20h20L12 12l10-10zM2 12l10 10H2V12z" fill="#7F52FF" />
  </svg>
);

const KubernetesIcon: React.FC<{ size?: number; className?: string }> = ({ size = 12, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 2l8.5 4.9v9.8L12 21.6 3.5 16.7V6.9L12 2zm0 2.5L5.5 8.2v7.6l6.5 3.7 6.5-3.7V8.2L12 4.5z" fill="#326CE5" />
    <circle cx="12" cy="12" r="2.5" fill="#326CE5" />
  </svg>
);

const FramerMotionIcon: React.FC<{ size?: number; className?: string }> = ({ size = 12, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M4 2h16v7h-8L4 2zm0 7h8l8 8H4V9zm8 8h8v6l-8-6z" fill="#0055FF" />
  </svg>
);

const FigmaIcon: React.FC<{ size?: number; className?: string }> = ({ size = 12, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M8 2h4v5H8a2.5 2.5 0 010-5z" fill="#F24E1E" />
    <path d="M12 2h4a2.5 2.5 0 010 5h-4V2z" fill="#FF7262" />
    <path d="M8 7h4v5H8a2.5 2.5 0 010-5z" fill="#A259FF" />
    <circle cx="14.5" cy="9.5" r="2.5" fill="#1ABCFE" />
    <path d="M8 12h4v2.5a2.5 2.5 0 01-5 0V12h1z" fill="#0ACF83" />
  </svg>
);

const RedisIcon: React.FC<{ size?: number; className?: string }> = ({ size = 12, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 2l9 4.5v11L12 22 3 17.5v-11L12 2zm0 2.8L5.5 8 12 11.2 18.5 8 12 4.8z" fill="#DC382D" />
  </svg>
);

const SqliteIcon: React.FC<{ size?: number; className?: string }> = ({ size = 12, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 3C6.5 3 2 4.8 2 7v10c0 2.2 4.5 4 10 4s10-1.8 10-4V7c0-2.2-4.5-4-10-4zm0 2.5c4.7 0 7.8 1.4 8 1.5-.2.1-3.3 1.5-8 1.5s-7.8-1.4-8-1.5c.2-.1 3.3-1.5 8-1.5zm0 13c-4.7 0-7.8-1.4-8-1.5V14c1.8 1.1 5 1.7 8 1.7s6.2-.6 8-1.7v3c-.2.1-3.3 1.5-8 1.5z" fill="#003B57" />
  </svg>
);

export const getTechIcon = (tech: string): React.ReactNode => {
  const t = tech.toLowerCase().trim();

  // TypeScript / TS
  if (t.includes('typescript') || t === 'ts') {
    return <TypeScriptIcon size={12} className="shrink-0" />;
  }
  // React / React 19 / Native
  if (t === 'react' || t.includes('react 19') || t.includes('reactjs') || t.includes('react native')) {
    return <ReactIcon size={12} className="shrink-0" />;
  }
  // Next.js
  if (t.includes('next')) {
    return <NextIcon size={12} className="shrink-0" />;
  }
  // Node.js
  if (t.includes('node')) {
    return <NodeIcon size={12} className="shrink-0" />;
  }
  // Python / Plumber
  if (t.includes('python')) {
    return <PythonIcon size={12} className="shrink-0" />;
  }
  // PostgreSQL
  if (t.includes('postgres') || t.includes('psql') || t.includes('pg')) {
    return <PostgresIcon size={12} className="shrink-0" />;
  }
  // Docker / Docker Compose
  if (t.includes('docker')) {
    return <DockerIcon size={12} className="shrink-0" />;
  }
  // Tailwind CSS
  if (t.includes('tailwind')) {
    return <TailwindIcon size={12} className="shrink-0" />;
  }
  // Leaflet / Maps
  if (t.includes('leaflet') || t.includes('map')) {
    return <LeafletIcon size={12} className="shrink-0" />;
  }
  // Vite
  if (t.includes('vite')) {
    return <ViteIcon size={12} className="shrink-0" />;
  }
  // C / C++ / Embedded
  if (t.includes('c++') || t === 'c') {
    return <CppIcon size={12} className="shrink-0" />;
  }
  // ESP32 / ESP8266
  if (t.includes('esp32') || t.includes('esp8266')) {
    return <Esp32Icon size={12} className="shrink-0" />;
  }
  // MQTT
  if (t.includes('mqtt')) {
    return <MqttIcon size={12} className="shrink-0" />;
  }
  // Go / Golang
  if (t === 'go' || t.startsWith('go ') || t.endsWith(' go') || t.includes('golang')) {
    return <GoIcon size={12} className="shrink-0" />;
  }
  // Rust
  if (t.includes('rust')) {
    return <RustIcon size={12} className="shrink-0" />;
  }
  // PyTorch
  if (t.includes('pytorch')) {
    return <PyTorchIcon size={12} className="shrink-0" />;
  }
  // FastAPI
  if (t.includes('fastapi')) {
    return <FastApiIcon size={12} className="shrink-0" />;
  }
  // GraphQL
  if (t.includes('graphql')) {
    return <GraphQLIcon size={12} className="shrink-0" />;
  }
  // Supabase
  if (t.includes('supabase')) {
    return <SupabaseIcon size={12} className="shrink-0" />;
  }
  // Prisma
  if (t.includes('prisma')) {
    return <PrismaIcon size={12} className="shrink-0" />;
  }
  // Flutter / Dart
  if (t.includes('flutter') || t.includes('dart')) {
    return <FlutterIcon size={12} className="shrink-0" />;
  }
  // Swift
  if (t.includes('swift')) {
    return <SwiftIcon size={12} className="shrink-0" />;
  }
  // Kotlin
  if (t.includes('kotlin')) {
    return <KotlinIcon size={12} className="shrink-0" />;
  }
  // Kubernetes / K8s
  if (t.includes('kubernetes') || t.includes('k8s')) {
    return <KubernetesIcon size={12} className="shrink-0" />;
  }
  // Framer Motion
  if (t.includes('motion') || t.includes('framer')) {
    return <FramerMotionIcon size={12} className="shrink-0" />;
  }
  // Figma / Design
  if (t.includes('figma')) {
    return <FigmaIcon size={12} className="shrink-0" />;
  }
  // Redis / Cache
  if (t.includes('redis')) {
    return <RedisIcon size={12} className="shrink-0" />;
  }
  // SQLite / SQL
  if (t.includes('sqlite') || t.includes('sql') || t.includes('duckdb') || t.includes('acid')) {
    return <SqliteIcon size={12} className="shrink-0" />;
  }
  // WebSockets / ws
  if (t.includes('websocket') || t.includes('ws') || t.includes('socket')) {
    return <Radio size={12} className="text-amber-500 shrink-0" />;
  }
  // IoT / Raspberry Pi / Hardware
  if (t.includes('raspberry') || t.includes('pi os') || t.includes('iot') || t.includes('hardware') || t.includes('embedded')) {
    return <Cpu size={12} className="text-rose-500 shrink-0" />;
  }
  // D3.js / Data Viz
  if (t.includes('d3')) {
    return <BarChart3 size={12} className="text-[#f9a03f] shrink-0" />;
  }
  // Auth / OAuth / JWT
  if (t.includes('auth') || t.includes('oauth') || t.includes('jwt') || t.includes('sso')) {
    return <Lock size={12} className="text-amber-400 shrink-0" />;
  }
  // AWS / S3 / Cloud
  if (t.includes('aws') || t.includes('s3') || t.includes('cloud')) {
    return <Cloud size={12} className="text-amber-500 shrink-0" />;
  }
  // CAN-Bus / Telemetry / Testing
  if (t.includes('can-bus') || t.includes('telemetry') || t.includes('test') || t.includes('jest') || t.includes('cypress') || t.includes('playwright')) {
    return <Activity size={12} className="text-sky-400 shrink-0" />;
  }

  // Fallback generic code tag icon
  return <Code2 size={11} className="text-zinc-400 shrink-0" />;
};

export const TechBadge: React.FC<TechBadgeProps> = ({ name, className = '', size = 'sm' }) => {
  const icon = getTechIcon(name);
  const sizeClasses = size === 'sm' 
    ? 'text-[11px] px-2.5 py-0.5' 
    : 'text-xs px-3 py-1';

  return (
    <span 
      className={`tech-badge-container inline-flex items-center gap-1.5 rounded-md font-mono shrink-0 bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-[var(--border-hover)] transition-colors shadow-2xs ${sizeClasses} ${className}`}
    >
      {icon}
      <span>{name}</span>
    </span>
  );
};
