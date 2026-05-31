import './globals.css';
import { Providers } from './provider'; // 🌟 Removed the .tsx extension so TypeScript compiles cleanly

export const metadata = {
  title: 'Portfolio Control Suite',
  description: 'Manage projects, workflow experiences, and visual assets.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        <Providers>
          <main className="mx-auto max-w-7xl p-6">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}