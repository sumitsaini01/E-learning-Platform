import { useEffect, useMemo, useState } from "react";
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
    <section className="space-y-8">
      <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-stone-50 p-6 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">
          Skill Tracking
        </p>

        <div className="mt-3 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-zinc-950">
              Your technical skill profile
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-600">
              SkillSphere calculates your skills automatically from enrolled
              courses, completed lessons, passed quizzes, and certificates.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-emerald-400"
          >
            {isRefreshing ? "Refreshing..." : "Refresh Skills"}
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {message ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {message}
        </div>
      ) : null}

      {isLoading ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-zinc-500">Loading skills...</p>
        </div>
      ) : skills.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-center shadow-sm">
          <h2 className="text-xl font-semibold text-zinc-950">
            No skills detected yet
          </h2>

          <p className="mt-2 text-sm text-zinc-600">
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
                className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-zinc-950">
                      {skill.name}
                    </h2>

                    <p className="mt-1 text-sm text-zinc-500">
                      Updated{" "}
                      {skill.lastUpdatedAt
                        ? new Date(skill.lastUpdatedAt).toLocaleDateString()
                        : "recently"}
                    </p>
                  </div>

                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-800">
                    {skill.progress}%
                  </span>
                </div>

                <div className="mt-5">
                  <div className="h-3 overflow-hidden rounded-full bg-zinc-100">
                    <div
                      className="h-full rounded-full bg-emerald-600 transition-all"
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
    </section>
  );
}

function StatCard({ label, value, small = false }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-zinc-500">{label}</p>

      <p
        className={`mt-2 font-semibold text-zinc-950 ${
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
    <div className="rounded-xl bg-stone-50 p-4">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-zinc-950">{value}</p>
    </div>
  );
}

export default SkillTrackingPage;
