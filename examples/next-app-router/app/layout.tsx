/** @jsxImportSource react */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'Avenir Next, Segoe UI, sans-serif', background: '#eef6fb' }}>
        {children}
      </body>
    </html>
  );
}
