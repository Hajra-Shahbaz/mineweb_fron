// app/layout.tsx
import './globals.css';
import { ReduxProvider } from './provider'; 
import { ThemeProvider } from "@/app/components/theme-provider";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import NavbarWrapper from '@/app/components/NavbarWrapper';
import AppWrapper from '@/app/components/AppWrapper'; // Import AppWrapper

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

export const metadata = {
  title: 'Hajra Shahbaz - Full Stack Developer Portfolio',
  description: 'Manage projects, workflow experiences, and visual assets.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("font-sans", geist.variable)}>
      <body>
        <ReduxProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            {/* Wrap everything with AppWrapper to fetch and apply brand color */}
            <AppWrapper>
              <NavbarWrapper />
              
              <link 
                rel="stylesheet" 
                href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css" 
              />
              {children}
            </AppWrapper>
          </ThemeProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}