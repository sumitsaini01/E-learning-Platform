import { useEffect, useMemo, useState } from "react";
import { Target } from "lucide-react";
import { getMySkills, refreshMySkills } from "../services/skillTrackingService";

function SkillTrackingPage() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const skills = useMemo(() => profile?.skills || [], [profile]);

  const averageSkillProgress = useMemo(() => {
    if (skills.length === 0) return 0;

    return Math.round(
      skills.reduce((total, skill) => total + (skill.progress || 0), 0) /
        skills.length,
    );
  }, [skills]);

  const loadSkills = async () => {
    try {
      setError("");
      setIsLoading(true);

      const data = await getMySkills();

      setProfile(data.profile);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load skills.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSkills();
  }, []);

  const handleRefresh = async () => {
    try {
      setError("");
      setMessage("");
      setIsRefreshing(true);

      const data = await refreshMySkills();

      setProfile(data.profile);
      setMessage(data.message || "Skills refreshed successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to refresh skills.");
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <section className="bg-slate-50 px-4 py-10 text-slate-950 transition-colors dark:bg-slate-950 dark:text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-300">
                <Target size={28} />
              </div>

              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                  Skill Tracking
                </p>

                <h1 className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">
                  Your technical skill profile
                </h1>

                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-400">
                  SkillSphere calculates your skills automatically from enrolled
                  courses, completed lessons, passed quizzes, and certificates.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
            >
              {isRefreshing ? "Refreshing..." : "Refresh Skills"}
            </button>
          </div>
        </div>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </div>
        ) : null}

        {message ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
            {message}
          </div>
        ) : null}

        {isLoading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Loading skills...
            </p>
          </div>
        ) : skills.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <h2 className="text-xl font-bold text-slate-950 dark:text-white">
              No skills detected yet
            </h2>

            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Enroll in courses, complete lessons, pass quizzes, or generate
              certificates to build your skill profile.
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <StatCard label="Tracked Skills" value={skills.length} />
              <StatCard
                label="Average Progress"
                value={`${averageSkillProgress}%`}
              />
              <StatCard
                label="Top Skill"
                value={skills[0]?.name || "N/A"}
                small
              />
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              {skills.map((skill) => (
                <div
                  key={skill._id || skill.name}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-bold text-slate-950 dark:text-white">
                        {skill.name}
                      </h2>

                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Updated{" "}
                        {skill.lastUpdatedAt
                          ? new Date(skill.lastUpdatedAt).toLocaleDateString()
                          : "recently"}
                      </p>
                    </div>

                    <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800 dark:bg-blue-950/40 dark:text-blue-300">
                      {skill.progress}%
                    </span>
                  </div>

                  <div className="mt-5">
                    <div className="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                      <div
                        className="h-full rounded-full bg-blue-600 transition-all"
                        style={{
                          width: `${skill.progress}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <MiniStat
                      label="Courses"
                      value={skill.sourceCourses?.length || 0}
                    />
                    <MiniStat
                      label="Quizzes Passed"
                      value={skill.quizzesPassed || 0}
                    />
                    <MiniStat
                      label="Certificates"
                      value={skill.certificatesEarned || 0}
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function StatCard({ label, value, small = false }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>

      <p
        className={`mt-2 font-bold text-slate-950 dark:text-white ${
          small ? "text-xl" : "text-3xl"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-bold text-slate-950 dark:text-white">
        {value}
      </p>
    </div>
  );
}

export default SkillTrackingPage;
