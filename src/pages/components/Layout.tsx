const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-gray-100">
      <main className="p-4">{children}</main>
    </div>
  );
};

export default Layout;
