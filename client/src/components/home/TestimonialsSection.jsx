import SectionHeading from "./SectionHeading";
import TestimonialCard from "../ui/TestimonialCard";

function TestimonialsSection({ testimonials = [], isLoading = false }) {
  const visibleTestimonials = testimonials.slice(0, 3);

  return (
    <section className="bg-white pt-8 pb-6 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Student Stories"
          title="What Learners Say About SkillSphere"
          description="Real feedback from students who are learning, building projects, and growing their careers with SkillSphere."
        />

        {isLoading ? (
          <div className="mt-8 sm:mt-10 grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-72 animate-pulse rounded-3xl bg-slate-100 dark:bg-slate-900"
              />
            ))}
          </div>
        ) : visibleTestimonials.length > 0 ? (
          <div className="mt-8 sm:mt-10 grid gap-6 md:grid-cols-3">
            {visibleTestimonials.map((testimonial) => (
              <TestimonialCard
                key={testimonial._id || testimonial.id || testimonial.name}
                testimonial={testimonial}
              />
            ))}
          </div>
        ) : (
          <div className="mt-8 sm:mt-10 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center dark:border-slate-800 dark:bg-slate-900">
            <p className="text-slate-600 dark:text-slate-400">
              No testimonials available yet.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export default TestimonialsSection;
