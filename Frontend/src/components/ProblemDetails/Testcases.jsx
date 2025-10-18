import React from "react";
import Discussions from "./Discussions";

const Testcases = ({
  problem,
  runResults,
  selectedTestCase,
  setSelectedTestCase,
  isMobile,
  user,
}) => {
  const formatError = (msg) => {
    if (!msg) return "";
    return msg
      .replace(/.*?\.cpp:/g, "") // remove full file path
      .replace(/\\r\\n/g, "\n")
      .trim();
  };

  // Any compile/runtime error is now in errorMessage
  const isErrorVerdict = Boolean(runResults?.errorMessage);

  const hasTestResults =
    Array.isArray(runResults?.details) && runResults.details.length > 0;

  const currentTest =
    hasTestResults && runResults.details[selectedTestCase]
      ? runResults.details[selectedTestCase]
      : null;

  return (
    <div className="flex flex-col p-3 overflow-y-auto">
      <h2 className="text-sm font-medium text-gray-400 mb-2">Output</h2>

      {/* Test case selector */}
      <div className="flex space-x-2 mb-3">
        {problem?.testCases?.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedTestCase(idx)}
            className={`px-3 py-1 text-sm font-medium rounded-md ${
              selectedTestCase === idx ? "bg-[#ffffff1A]" : ""
            }`}
          >
            {!isErrorVerdict && hasTestResults ? (
              runResults.details[idx].passed ? (
                <span className="inline-block w-2 h-2 mr-2 rounded-full bg-green-500"></span>
              ) : (
                <span className="inline-block w-2 h-2 mr-2 rounded-full bg-red-500"></span>
              )
            ) : null}
            Test Case {idx + 1}
          </button>
        ))}
      </div>

      <div className="flex-1 bg-[#1e1e1e] text-gray-100 p-3 rounded-md">
        {/* Compilation / Runtime Errors */}
        {isErrorVerdict && (
          <div className="rounded-xl p-4 space-y-2">
            <p className="text-lg font-semibold tracking-wide text-red-500">
              {runResults.verdict || "Error"}
            </p>
            <pre className="text-sm font-mono text-gray-200 whitespace-pre-wrap p-3 rounded-lg overflow-x-auto">
              {formatError(runResults.errorMessage)}
            </pre>
          </div>
        )}

        {/* Test Case Results */}
        {!isErrorVerdict && currentTest && (
          <div className="bg-[#1e1e1e] p-4 rounded-md space-y-3 max-h-96">
            <div className="bg-[#2a2a2a] p-3 rounded-md">
              <p className="text-xs text-gray-400 mb-1">Input</p>
              <pre className="text-sm font-mono text-gray-200 whitespace-pre-wrap p-3 overflow-x-auto">
                {currentTest.input}
              </pre>
            </div>

            <div className="bg-[#2a2a2a] p-3 rounded-md">
              <p className="text-xs text-gray-400 mb-1">Output</p>
              <pre className="text-sm font-mono text-white whitespace-pre-wrap p-3 overflow-x-auto">
                {currentTest.output}
              </pre>
            </div>

            <div className="bg-[#2a2a2a] p-3 rounded-md">
              <p className="text-xs text-gray-400 mb-1">Expected Output</p>
              <pre className="text-sm font-mono text-white whitespace-pre-wrap p-3 overflow-x-auto">
                {currentTest.expectedOutput}
              </pre>
            </div>
          </div>
        )}

        {/* Show original test case if no run results */}
        {!isErrorVerdict &&
          !hasTestResults &&
          problem?.testCases?.[selectedTestCase] && (
            <div className="bg-[#1e1e1e] p-4 rounded-md space-y-3 max-h-96">
              <div className="bg-[#2a2a2a] p-3 rounded-md mb-2">
                <p className="text-xs text-gray-400 mb-1">Input</p>
                <pre className="text-sm font-mono text-white whitespace-pre-wrap p-3 overflow-x-auto">
                  {problem.testCases[selectedTestCase].input}
                </pre>
              </div>
              <div className="bg-[#2a2a2a] p-3 rounded-md">
                <p className="text-xs text-gray-400 mb-1">Expected Output</p>
                <pre className="text-sm font-mono text-white whitespace-pre-wrap p-3 overflow-x-auto">
                  {problem.testCases[selectedTestCase].output}
                </pre>
              </div>
            </div>
          )}
      </div>
      {isMobile && <Discussions problem={problem} user={user} />}
    </div>
  );
};

export default Testcases;
