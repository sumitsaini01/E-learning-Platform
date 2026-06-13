import { BookOpen, Mail, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link to="/" className="inline-flex items-center gap-3">
              <div className="rounded-2xl bg-blue-600 p-2.5 text-white">
                <BookOpen size={20} />
              </div>

              <div>
                <h3 className="text-xl font-extrabold">SkillSphere</h3>
                <p className="text-xs text-slate-400">Learn • Build • Grow</p>
              </div>
            </Link>

            <p className="mt-5 max-w-sm text-sm leading-7 text-slate-400">
              Learn, grow, and achieve your goals through high-quality courses,
              practical projects, certifications, and AI-powered learning tools.
            </p>
          </div>

          <FooterColumn
            title="Platform"
            links={[
              { label: "All Courses", to: "/courses" },
              { label: "AI Features", to: "/ai-features" },
              { label: "My Certificates", to: "/my-certificates" },
            ]}
          />

          <FooterColumn
            title="Company"
            links={[
              { label: "About Us", to: "/about" },
              { label: "Contact Us", to: "/contact" },
              { label: "Resources", to: "/about" },
            ]}
          />

          <div>
            <h4 className="font-bold text-white">Support</h4>

            <div className="mt-5 space-y-4 text-sm text-slate-400">
              <p className="flex items-center gap-3">
                <Mail size={16} className="text-blue-400" />
                skillsphere01@gmail.com
              </p>

              <p className="flex items-center gap-3">
                <Phone size={16} className="text-blue-400" />
                +91 98765 43***
              </p>

              <p className="flex items-center gap-3">
                <MapPin size={16} className="text-blue-400" />
                Chandigarh, India
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-slate-800 pt-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} SkillSphere. All rights reserved.</p>

          <div className="flex gap-5">
            <Link to="/about" className="transition hover:text-blue-400">
              Privacy
            </Link>
            <Link to="/about" className="transition hover:text-blue-400">
              Terms
            </Link>
            <Link to="/contact" className="transition hover:text-blue-400">
              Support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }) {
  return (
    <div>
      <h4 className="font-bold text-white">{title}</h4>

      <ul className="mt-5 space-y-3 text-sm text-slate-400">
        {links.map((link) => (
          <li key={link.to}>
            <Link to={link.to} className="transition hover:text-blue-400">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Footer;