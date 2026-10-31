import './globals.css';
import Sidebar from '../components/sidebar';
import { document } from '../lib/content.mjs';
export const metadata = { title: 'Senior Software Engineer' };
export const dynamic = 'force-dynamic';
export default async function RootLayout({ children }) {
  const sidebar = await document('shared/sidebar','Shared/sidebar.json','sidebar');
  return <html lang="en"><body><Sidebar content={sidebar}/>{children}</body></html>;
}
