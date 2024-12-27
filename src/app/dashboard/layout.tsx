import type { Metadata } from 'next';
import { Sidebar } from '@/components/dashboardsidebar';
import { Navbar } from '@/components/navbar';
import { ThemeProvider } from '@/components/theme-provider';

export const metadata: Metadata = {
  title: 'LMS',
  description:
    'This Profile Page has All the Course Details Including the Purchases and Courses which you Published!',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="plus-jakarta-sans" id="scroll">
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Navbar />
          <main className="flex-1 overflow-y-auto overflow-x-hidden">
            <ThemeProvider attribute="class" defaultTheme="dark" disableTransitionOnChange>
              <div className="container mx-auto px-6 py-8">{children}</div>
            </ThemeProvider>
          </main>
        </div>
      </div>
    </div>
  );
}
