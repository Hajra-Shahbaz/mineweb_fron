import './globals.css';
import { ReduxProvider } from './provider'; // 🌟 Removed the .tsx extension so TypeScript compiles cleanly

export const metadata = {
  title: 'Portfolio Control Suite',
  description: 'Manage projects, workflow experiences, and visual assets.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        <ReduxProvider>
          <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css" 
        />
          {children}
        </ReduxProvider>
      </body>
    </html>
  );
}