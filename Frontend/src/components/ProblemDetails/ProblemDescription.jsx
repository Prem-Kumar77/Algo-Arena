import { React, useEffect, useState } from "react";
import axiosInstance from "@/utils/axios";
import Discussions from "@/components/ProblemDetails/Discussions.jsx";

const ProblemDescription = ({
  problem,
  selectedTab,
  setSelectedTab,
  output,
  user,
  selectedSubmission,
  openSubmissionTab,
  closeSubmissionTab,
  inContest,
  isMobile,
}) => {
  const difficultyColors = {
    Easy: "text-green-500",
    Medium: "text-yellow-500",
    Hard: "text-red-500",
  };

  const [submissions, setSubmissions] = useState([]);
  const [status, setStatus] = useState(""); // ✅ "Solved", "Attempted", or ""

  useEffect(() => {
    async function fetchSubmissions() {
      if (!user || !problem) return;
      try {
        const response = await axiosInstance.get(
          `/submissions/problem/${problem._id}`
        );
        const subs = response.data;
        setSubmissions(subs);

        // ✅ Determine status
        if (subs.some((sub) => sub.verdict === "Accepted")) {
          setStatus("Solved");
        } else if (subs.length > 0) {
          setStatus("Attempted");
        } else {
          setStatus("");
        }
      } catch (err) {
        console.error("Error fetching submissions:", err);
      }
    }

    fetchSubmissions();
  }, [problem._id, output]);

  return (
    <div className="h-full overflow-y-auto p-6">
      {/* Tabs */}
      <div className="flex space-x-4 border-b border-gray-700 mb-4">
        {["Problem Details", "Submissions"].map((tab) => (
          <button
            key={tab}
            className={`px-3 py-2 font-medium ${
              selectedTab === tab
                ? "border-b-2 border-blue-500"
                : "text-gray-400"
            }`}
            onClick={() => setSelectedTab(tab)}
          >
            {tab}
          </button>
        ))}

        {selectedSubmission && (
          <div className="flex items-center space-x-2">
            <button
              className={`px-3 py-2 font-medium flex items-center ${
                selectedTab === "Submission Details"
                  ? "border-b-2 border-blue-500"
                  : "text-gray-400"
              }`}
              onClick={() => setSelectedTab("Submission Details")}
            >
              Submission Details
              <span
                className="ml-2 text-gray-400 hover:text-white cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  closeSubmissionTab();
                }}
              >
                ✕
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Tab content */}
      {selectedTab === "Problem Details" && (
        <div>
          {/* ✅ Title + badge */}
          <div className="flex items-center space-x-3 mb-4">
            <h1 className="text-2xl font-bold">{problem?.title}</h1>

            {status === "Solved" && (
              <span className="text-sm bg-green-600 text-white px-3 py-1 rounded-full">
                Solved
              </span>
            )}
            {status === "Attempted" && (
              <span className="text-sm bg-yellow-500 text-black px-3 py-1 rounded-full">
                Attempted
              </span>
            )}
          </div>

          <p
            className={`${difficultyColors[problem.difficulty] || "text-gray-400"} mb-4`}
          >
            {problem?.difficulty}
          </p>

          <div className="prose prose-invert max-w-none">
            <p>{problem?.description}</p>

            {/* Examples */}
            {problem?.examples?.length > 0 && (
              <div className="mt-6 space-y-4">
                {problem.examples.map((example, index) => (
                  <div key={index}>
                    <p className="whitespace-pre-wrap break-words mb-2">
                      <strong>Example {index + 1}:</strong>
                    </p>
                    <div className="border-l-2 border-l-gray-700 px-3 text-gray-200">
                      <p>
                        <strong>Input:</strong> {example.input}
                      </p>
                      <p>
                        <strong>Output:</strong> {example.output}
                      </p>
                      {example.explanation && (
                        <p>
                          <strong>Explanation:</strong> {example.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Constraints */}
            {problem?.constraints?.length > 0 && (
              <div className="mt-6">
                <h2 className="text-lg font-semibold mb-2">Constraints</h2>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
                  {problem.constraints.map((constraint, index) => (
                    <li key={index}>{constraint}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          {!inContest && !isMobile && (
            <Discussions problem={problem} user={user} />
          )}
        </div>
      )}

      {/* Submissions tab */}
      {selectedTab === "Submissions" && (
        <div className="space-y-3">
          {submissions.length > 0 ? (
            submissions.map((sub, idx) => (
              <div
                key={idx}
                className="p-3 bg-[#2a2a2a] rounded-md cursor-pointer hover:bg-[#3a3a3a]"
                onClick={() => openSubmissionTab(sub)}
              >
                <p>
                  <strong>Submission {idx + 1}:</strong> {sub.verdict}
                </p>
                <p className="text-xs text-gray-400">
                  {sub.submittedAt
                    ? new Date(sub.submittedAt).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })
                    : "Just now"}
                </p>
              </div>
            ))
          ) : (
            <p className="text-gray-400">No submissions yet.</p>
          )}
        </div>
      )}

      {/* Submission details */}
      {selectedTab === "Submission Details" && selectedSubmission && (
        <div className="p-3 bg-[#1e1e1e] rounded-md overflow-auto">
          <h2 className="font-semibold mb-2">Submission Details</h2>
          <p>
            <strong>Verdict:</strong> {selectedSubmission.verdict}
          </p>
          <p>
            <strong>Language:</strong> {selectedSubmission.language}
          </p>
          <pre className="bg-[#2a2a2a] p-2 rounded-md overflow-auto text-sm">
            {selectedSubmission.code}
          </pre>
        </div>
      )}
    </div>
  );
};

export default ProblemDescription;
