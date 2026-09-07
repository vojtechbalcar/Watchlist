export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <footer className="site-footer">
        <span>Market snapshot &nbsp; / &nbsp; Aug 25, 15:58 ET</span>
        <span>Demo data &nbsp; &middot; &nbsp; Prices in USD</span>
      </footer>
    </>
  );
}
