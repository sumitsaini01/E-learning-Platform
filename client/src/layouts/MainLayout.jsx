import { Outlet } from "react-router-dom";
import Navbar from "../components/navbar/Navbar";
import Footer from "../components/Footer";

function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-stone-50 text-zinc-950 transition-colors dark:bg-zinc-950 dark:text-zinc-50">
      <Navbar />

      <main className="w-full flex-1 overflow-x-hidden">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

export default MainLayout;
