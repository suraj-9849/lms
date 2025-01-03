import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '@/components/theme-provider';

export const metadata: Metadata = {
  title: 'LMS',
  description: `Learn, Grow and Make Others Grow!
  Seamlessly connect learners and educators with innovative tools for interactive learning. Your journey to growth starts with simplified education, anytime, anywhere.`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="next.svg" />
        {/* eslint-disable */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
          rel="stylesheet"
        />
        {/* eslint-enable  */}
      </head>
      <ThemeProvider attribute="class" defaultTheme="dark" disableTransitionOnChange>
        <Toaster />
        <body id="scroll" className={`plus-jakarta-sans antialiased`}>
          {children}
        </body>
      </ThemeProvider>
    </html>
  );
}
