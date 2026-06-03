import Certificate from "../models/Certificate.js";
import Course from "../models/Course.js";
import Progress from "../models/Progress.js";
import Quiz from "../models/Quiz.js";
import QuizAttempt from "../models/QuizAttempt.js";
import SkillProfile from "../models/SkillProfile.js";

const normalizeSkill = (skill) => String(skill || "").trim();

const extractCourseSkills = (course) => {
  const skills = [];

  if (course.category) {
    skills.push(course.category);
  }

  if (Array.isArray(course.skills)) {
    skills.push(...course.skills);
  }

  return [...new Set(skills.map(normalizeSkill).filter(Boolean))];
};

const calculateCourseCompletion = (course, progress) => {
  const totalLessons = (course.sections || []).reduce(
    (total, section) => total + (section.lessons?.length || 0),
    0,
  );

  const completedLessons = progress?.completedLessons?.length || 0;

  if (totalLessons === 0) return 0;

  return Math.round((completedLessons / totalLessons) * 100);
};

const upsertSkill = (skillsMap, skillName, data) => {
  const normalizedName = normalizeSkill(skillName);

  if (!normalizedName) return;

  const current = skillsMap.get(normalizedName.toLowerCase()) || {
    name: normalizedName,
    progress: 0,
    sourceCourses: new Set(),
    quizzesPassed: 0,
    certificatesEarned: 0,
  };

  current.progress = Math.max(current.progress, data.progress || 0);

  if (data.courseId) {
    current.sourceCourses.add(data.courseId.toString());
  }

  current.quizzesPassed += data.quizzesPassed || 0;
  current.certificatesEarned += data.certificatesEarned || 0;

  skillsMap.set(normalizedName.toLowerCase(), current);
};

export const recalculateUserSkills = async (userId) => {
  const courses = await Course.find({
    students: userId,
  });

  const skillsMap = new Map();

  for (const course of courses) {
    const progress = await Progress.findOne({
      user: userId,
      course: course._id,
    });

    const courseSkills = extractCourseSkills(course);
    const completion = calculateCourseCompletion(course, progress);

    courseSkills.forEach((skill) => {
      upsertSkill(skillsMap, skill, {
        progress: Math.min(completion, 80),
        courseId: course._id,
      });
    });
  }

  const passedAttempts = await QuizAttempt.find({
    user: userId,
    passed: true,
  }).populate("course");

  passedAttempts.forEach((attempt) => {
    const courseSkills = extractCourseSkills(attempt.course);

    courseSkills.forEach((skill) => {
      upsertSkill(skillsMap, skill, {
        progress: Math.max(60, attempt.percentage || 0),
        courseId: attempt.course?._id,
        quizzesPassed: 1,
      });
    });
  });

  const certificates = await Certificate.find({
    user: userId,
    status: "active",
  }).populate("course");

  certificates.forEach((certificate) => {
    const courseSkills = extractCourseSkills(certificate.course);

    courseSkills.forEach((skill) => {
      upsertSkill(skillsMap, skill, {
        progress: 100,
        courseId: certificate.course?._id,
        certificatesEarned: 1,
      });
    });
  });

  const skills = [...skillsMap.values()]
    .map((skill) => ({
      name: skill.name,
      progress: Math.min(100, Math.round(skill.progress)),
      sourceCourses: [...skill.sourceCourses],
      quizzesPassed: skill.quizzesPassed,
      certificatesEarned: skill.certificatesEarned,
      lastUpdatedAt: new Date(),
    }))
    .sort((a, b) => b.progress - a.progress);

  const profile = await SkillProfile.findOneAndUpdate(
    {
      user: userId,
    },
    {
      user: userId,
      skills,
    },
    {
      upsert: true,
      new: true,
      runValidators: true,
    },
  );

  return profile;
};
