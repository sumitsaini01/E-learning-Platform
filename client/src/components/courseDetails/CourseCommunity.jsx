function CourseCommunity({
  discussions = [],
  filteredDiscussions = [],
  discussionFilter,
  setDiscussionFilter,
  discussionError,
  discussionMessage,
  canUseDiscussions,
  discussionForm,
  setDiscussionForm,
  handleSubmitDiscussion,
  replyForms,
  setReplyForms,
  handleSubmitReply,
  handleToggleResolved,
  getUserId,
  studentId,
  user,
}) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-zinc-950 dark:text-white">
            Course Community
          </h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-slate-400">
            Discuss lessons, ask doubts, share ideas, and help other learners.
          </p>
        </div>

        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800 dark:bg-blue-950 dark:text-blue-300">
          {discussions.length} discussions
        </span>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {["all", "open", "resolved"].map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setDiscussionFilter(filter)}
            className={`rounded-full px-3 py-1 text-xs font-semibold capitalize transition ${
              discussionFilter === filter
                ? "bg-blue-600 text-white"
                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-slate-800 dark:text-slate-300"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {discussionError ? (
        <Message type="error">{discussionError}</Message>
      ) : null}

      {discussionMessage ? (
        <Message type="success">{discussionMessage}</Message>
      ) : null}

      {canUseDiscussions ? (
        <form
          onSubmit={handleSubmitDiscussion}
          className="mt-5 rounded-2xl border border-blue-100 bg-blue-50/40 p-5 dark:border-blue-900 dark:bg-blue-950/20"
        >
          <h3 className="font-semibold text-zinc-950 dark:text-white">
            Start a discussion
          </h3>

          <input
            type="text"
            value={discussionForm.title}
            onChange={(event) =>
              setDiscussionForm((current) => ({
                ...current,
                title: event.target.value,
              }))
            }
            placeholder="Example: I am confused about useEffect dependencies"
            className={inputClass}
          />

          <textarea
            value={discussionForm.message}
            onChange={(event) =>
              setDiscussionForm((current) => ({
                ...current,
                message: event.target.value,
              }))
            }
            placeholder="Explain your question in detail."
            className={`${inputClass} min-h-24 resize-y`}
          />

          <button
            type="submit"
            className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Post Discussion
          </button>
        </form>
      ) : (
        <p className="mt-5 rounded-md bg-stone-50 px-3 py-2 text-sm text-zinc-600 dark:bg-slate-950 dark:text-slate-400">
          Enroll in this course to participate in discussions.
        </p>
      )}

      <div className="mt-6 space-y-5">
        {filteredDiscussions.length === 0 ? (
          <p className="rounded-md bg-stone-50 p-4 text-sm text-zinc-600 dark:bg-slate-950 dark:text-slate-400">
            No discussions found. Start the community conversation.
          </p>
        ) : (
          filteredDiscussions.map((discussion) => {
            const canMarkResolved =
              getUserId(discussion.user) === studentId ||
              user?.role === "instructor" ||
              user?.role === "admin";

            return (
              <div
                key={discussion._id}
                className="rounded-2xl border border-zinc-200 p-5 dark:border-slate-800"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-zinc-950 dark:text-white">
                        {discussion.title}
                      </h3>

                      <StatusBadge resolved={discussion.isResolved} />

                      <span className="rounded-full bg-zinc-100 px-2 py-1 text-xs font-semibold text-zinc-700 dark:bg-slate-800 dark:text-slate-300">
                        {discussion.replies?.length || 0} replies
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-zinc-500 dark:text-slate-500">
                      Asked by {discussion.name} •{" "}
                      {new Date(discussion.createdAt).toLocaleString()}
                    </p>
                  </div>

                  {canMarkResolved ? (
                    <button
                      type="button"
                      onClick={() => handleToggleResolved(discussion._id)}
                      className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      {discussion.isResolved ? "Reopen" : "Mark Resolved"}
                    </button>
                  ) : null}
                </div>

                <p className="mt-4 whitespace-pre-line text-sm leading-6 text-zinc-700 dark:text-slate-300">
                  {discussion.message}
                </p>

                <div className="mt-5 space-y-3">
                  {discussion.replies?.map((reply, index) => (
                    <div
                      key={`${discussion._id}-${index}`}
                      className="rounded-xl border border-zinc-100 bg-stone-50 p-4 dark:border-slate-800 dark:bg-slate-950"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-zinc-950 dark:text-white">
                          {reply.name}
                        </p>

                        <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-xs font-medium capitalize text-zinc-700 dark:bg-slate-800 dark:text-slate-300">
                          {reply.role}
                        </span>
                      </div>

                      <p className="mt-2 whitespace-pre-line text-sm leading-6 text-zinc-700 dark:text-slate-300">
                        {reply.message}
                      </p>

                      <p className="mt-2 text-xs text-zinc-400">
                        {reply.createdAt
                          ? new Date(reply.createdAt).toLocaleString()
                          : ""}
                      </p>
                    </div>
                  ))}
                </div>

                {canUseDiscussions ? (
                  <form
                    onSubmit={(event) =>
                      handleSubmitReply(event, discussion._id)
                    }
                    className="mt-4 flex flex-col gap-3 sm:flex-row"
                  >
                    <input
                      type="text"
                      value={replyForms[discussion._id] || ""}
                      onChange={(event) =>
                        setReplyForms((current) => ({
                          ...current,
                          [discussion._id]: event.target.value,
                        }))
                      }
                      placeholder="Write a reply..."
                      className="flex-1 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-blue-950"
                    />

                    <button
                      type="submit"
                      className="rounded-md bg-zinc-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-blue-600 dark:hover:bg-blue-700"
                    >
                      Reply
                    </button>
                  </form>
                ) : null}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function StatusBadge({ resolved }) {
  return resolved ? (
    <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
      Resolved
    </span>
  ) : (
    <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
      Open
    </span>
  );
}

function Message({ type, children }) {
  const className =
    type === "error"
      ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
      : "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300";

  return (
    <div className={`mt-5 rounded-md border px-3 py-2 text-sm ${className}`}>
      {children}
    </div>
  );
}

const inputClass =
  "mt-4 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-blue-950";

export default CourseCommunity;
