export const metadata = {
  title: 'Portfolio Control Suite',
  description: 'Manage projects, workflow experiences, and visual assets.',
};// app/admin-hs/layout.tsx

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // By NOT including the Navbar component here, 
  // this layout will render only the children, 
  // effectively "stripping" the root layout's navbar for all routes 
  // starting with /admin-hs.
  return (
    <div className="admin-root">
      {children}
    </div>
  );
}