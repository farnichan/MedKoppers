import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

// Public pages (landing, demo test, log in, sign up): site navbar + footer.
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
