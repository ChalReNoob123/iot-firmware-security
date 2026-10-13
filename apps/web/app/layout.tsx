import type { Metadata } from 'next';
import './globals.css';
import AttestationModal from '@/components/AttestationModal';
import FirmwareUploadModal from '@/components/FirmwareUploadModal';
import GlobalCinematicBackdrop from '@/components/motion/GlobalCinematicBackdrop';
import FluidCyberCursor from '@/components/motion/FluidCyberCursor';
import CyberToastNotifier from '@/components/CyberToastNotifier';
import LayoutShell from '@/components/navigation/LayoutShell';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: 'SentinelForge | Autonomous IoT Firmware Security & Zero-Day Discovery Platform',
    template: '%s | SentinelForge'
  },
  description:
    'Industrial-grade automated firmware security analysis, dynamic microVM emulation, and attack-graph synthesis platform.',
  keywords: [
    'IoT Security',
    'Firmware Analysis',
    'Zero-Day Vulnerability Discovery',
    'CISA KEV',
    'Dynamic Emulation',
    'Attack Graph Synthesis',
    'SBOM VEX'
  ],
  authors: [{ name: 'SentinelForge CyberOps Lab' }],
  openGraph: {
    title: 'SentinelForge | Autonomous IoT Firmware Security',
    description: 'Industrial-grade automated firmware security analysis, microVM emulation, and attack-graph synthesis.',
    url: 'http://localhost:3000',
    siteName: 'SentinelForge',
    locale: 'en_US',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SentinelForge | Autonomous IoT Firmware Security',
    description: 'Autonomous firmware security, zero-day discovery, and microVM emulation.'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="bg-void-950 text-zinc-100 min-h-screen flex flex-col antialiased selection:bg-neon-cyan selection:text-void-950 relative font-sans">
        {/* Global Ambient Cyber Backdrop & Fluid Cursor */}
        <GlobalCinematicBackdrop />
        <FluidCyberCursor />

        {/* Adaptive Layout Shell */}
        <LayoutShell>{children}</LayoutShell>

        {/* Global Mandatory Attestation & Firmware Ingestion Modals */}
        <AttestationModal />
        <FirmwareUploadModal />
        <CyberToastNotifier />
      </body>
    </html>
  );
}
