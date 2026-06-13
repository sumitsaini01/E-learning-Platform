import { Mail, MapPin, Phone } from "lucide-react";

function ContactPage() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-16 text-center text-white">
        <h1 className="text-4xl font-bold md:text-5xl">Contact Us</h1>

        <p className="mx-auto mt-6 max-w-3xl text-lg text-emerald-50">
          We'd love to hear from you. Whether you have a question, feedback,
          partnership inquiry, or need support, our team is here to help.
        </p>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white">
            Get In Touch
          </h2>

          <div className="mt-8 space-y-6">
            <ContactItem
              icon={<Mail size={18} />}
              label="Email"
              value="support@skillsphere.com"
              href="mailto:support@skillsphere.com"
            />

            <ContactItem
              icon={<Phone size={18} />}
              label="Phone"
              value="+91 98765 43210"
              href="tel:+919876543210"
            />

            <ContactItem
              icon={<MapPin size={18} />}
              label="Address"
              value="Chandigarh, India"
            />

            <div>
              <p className="font-semibold text-zinc-900 dark:text-white">
                Working Hours
              </p>
              <p className="mt-1 text-zinc-600 dark:text-slate-400">
                Monday - Friday
              </p>
              <p className="text-zinc-600 dark:text-slate-400">
                9:00 AM - 6:00 PM
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 shadow-sm dark:border-emerald-900 dark:bg-slate-900">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white">
            Need Help?
          </h2>

          <p className="mt-4 text-sm leading-7 text-zinc-700 dark:text-slate-300">
            Our contact form will be connected in a future update. For now,
            please contact us directly by email for support, course issues,
            partnership queries, or feedback.
          </p>

          <a
            href="mailto:support@skillsphere.com"
            className="mt-6 inline-flex rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Email Support
          </a>

          <div className="mt-6 rounded-xl border border-emerald-200 bg-white p-4 text-sm text-zinc-700 dark:border-emerald-900 dark:bg-slate-900 dark:text-slate-300">
            <p className="font-semibold text-zinc-900 dark:text-white">
              Recommended email details:
            </p>

            <ul className="mt-3 list-disc space-y-1 pl-5">
              <li>Your registered email</li>
              <li>Course name, if related to a course</li>
              <li>Screenshot or error message, if applicable</li>
              <li>A short description of the issue</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white">
          Frequently Asked Questions
        </h2>

        <div className="mt-6 space-y-4">
          <FAQItem
            question="How do I enroll in a course?"
            answer="Visit the course page and click the enroll button. Free courses enroll instantly, while paid courses use Razorpay checkout."
          />

          <FAQItem
            question="Will I receive a certificate?"
            answer="Yes, certificates are available after successfully completing eligible courses."
          />

          <FAQItem
            question="How can instructors create courses?"
            answer="Instructor accounts can create, manage, and publish courses through the instructor dashboard."
          />
        </div>
      </div>
    </section>
  );
}

function ContactItem({ icon, label, value, href }) {
  const content = (
    <div className="flex items-start gap-3">
      <span className="mt-1 text-emerald-600 dark:text-emerald-400">
        {icon}
      </span>

      <div>
        <p className="font-semibold text-zinc-900 dark:text-white">{label}</p>
        <p className="mt-1 text-zinc-600 dark:text-slate-400">{value}</p>
      </div>
    </div>
  );

  if (href) {
    return (
      <a href={href} className="block transition hover:opacity-80">
        {content}
      </a>
    );
  }

  return content;
}

function FAQItem({ question, answer }) {
  return (
    <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800 dark:bg-slate-950">
      <h3 className="font-semibold text-zinc-900 dark:text-white">
        {question}
      </h3>

      <p className="mt-2 text-sm text-zinc-600 dark:text-slate-400">{answer}</p>
    </div>
  );
}

export default ContactPage;
