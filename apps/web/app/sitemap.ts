import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const routes = [
    '',
    '/login',
    '/dashboard',
    '/devices',
    '/firmware',
    '/emulator',
    '/attack-graph',
    '/copilot',
    '/sbom-vex',
    '/reports',
    '/side-channel',
    '/war-room'
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : 0.8,
  }));
}
