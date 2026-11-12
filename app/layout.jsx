import './globals.css';
import Sidebar from '../components/sidebar';
import { document, leafStatus } from '../lib/content.mjs';
export async function generateMetadata() {
  return { title: 'Senior Software Engineer', other: {'leaf-status': await leafStatus()} };
}
export const dynamic = 'force-dynamic';
export default async function RootLayout({ children }) {
  const sidebar = await document('shared/sidebar','Shared/sidebar.json','sidebar');
  return <html lang="en"><body><Sidebar content={sidebar}/>{children}</body></html>;
}
