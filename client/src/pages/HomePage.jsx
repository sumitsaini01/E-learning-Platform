import HeroSection from "../components/home/HeroSection";
import FeaturedCourses from "../components/home/FeaturedCourses";
import TopCategories from "../components/home/TopCategories";
import TestimonialsSection from "../components/home/TestimonialsSection";
import StatsSection from "../components/home/StatsSection";

const featuredCourses = [
  {
    id: 1,
    title: "MERN Stack Development",
    instructor: "John Smith",
    category: "Development",
    price: "₹2,999",
    rating: 4.8,
    students: 3200,
  },
  {
    id: 2,
    title: "UI/UX Design Masterclass",
    instructor: "Sarah Johnson",
    category: "Design",
    price: "₹1,999",
    rating: 4.9,
    students: 2100,
  },
  {
    id: 3,
    title: "Data Science Bootcamp",
    instructor: "David Wilson",
    category: "Data Science",
    price: "₹3,499",
    rating: 4.7,
    students: 1800,
  },
];

const categories = [
  {
    id: 1,
    name: "Development",
    slug: "development",
    icon: "💻",
    coursesCount: 120,
    description:
      "Master web development, mobile apps, backend systems, and software engineering.",
    color: "from-blue-600 to-cyan-500",
  },
  {
    id: 2,
    name: "Design",
    slug: "design",
    icon: "🎨",
    coursesCount: 80,
    description:
      "Learn UI/UX, graphic design, prototyping, design systems, and creativity.",
    color: "from-purple-600 to-pink-500",
  },
  {
    id: 3,
    name: "Business",
    slug: "business",
    icon: "💼",
    coursesCount: 65,
    description:
      "Develop leadership, entrepreneurship, project management, and strategy skills.",
    color: "from-amber-500 to-orange-500",
  },
  {
    id: 4,
    name: "Marketing",
    slug: "marketing",
    icon: "📢",
    coursesCount: 50,
    description:
      "Master digital marketing, SEO, social media, branding, and advertising.",
    color: "from-rose-500 to-red-500",
  },
  {
    id: 5,
    name: "Data Science",
    slug: "data-science",
    icon: "📊",
    coursesCount: 70,
    description:
      "Learn analytics, machine learning, statistics, visualization, and big data.",
    color: "from-emerald-500 to-teal-500",
  },
  {
    id: 6,
    name: "Artificial Intelligence",
    slug: "artificial-intelligence",
    icon: "🤖",
    coursesCount: 40,
    description:
      "Build AI-powered applications using LLMs, deep learning, and automation.",
    color: "from-indigo-600 to-violet-500",
  },
];

const testimonials = [
  {
    id: 1,
    name: "Rahul Sharma",
    role: "Frontend Developer",
    review:
      "SkillSphere helped me transition from a beginner to a job-ready developer. The courses and AI tools are excellent.",
  },
  {
    id: 2,
    name: "Priya Verma",
    role: "UI/UX Designer",
    review:
      "The learning path and mock interview features gave me confidence during placements.",
  },
  {
    id: 3,
    name: "Aman Gupta",
    role: "Software Engineer",
    review:
      "The platform feels modern, organized, and extremely useful for students preparing for careers.",
  },
];

const stats = [
  { value: "10K+", label: "Active Learners" },
  { value: "500+", label: "Courses" },
  { value: "150+", label: "Expert Instructors" },
  { value: "95%", label: "Success Rate" },
];

function HomePage() {
  return (
    <div>
      <HeroSection />

      <FeaturedCourses courses={featuredCourses} />

      <TopCategories categories={categories} />

      <TestimonialsSection testimonials={testimonials} />

      <StatsSection stats={stats} />
    </div>
  );
}

export default HomePage;
