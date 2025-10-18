import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axiosInstance from "../utils/axios";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Play, Pause, RotateCcw } from "lucide-react";

import ProblemDescription from "@/components/ProblemDetails/ProblemDescription.jsx";
import CodeEditor from "@/components/ProblemDetails/CodeEditor.jsx";
import Testcases from "@/components/ProblemDetails/Testcases.jsx";

const ProblemDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [problem, setProblem] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();
  const [lang, setLang] = useState("cpp");
  const [selectedTestCase, setSelectedTestCase] = useState(0);
  const [code, setCode] = useState({
    cpp: "// C++ code here",
    python: "# Python code here",
    javascript: "// JavaScript code here",
    java: "// Java code here",
  });

  const [running, setRunning] = useState(false);
  const [runResults, setRunResults] = useState([]);
  const [submitting, setSubmitting] = useState();
  const [selectedTab, setSelectedTab] = useState("Problem Details");
  const [user, setUser] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [output, setOutput] = useState(null);

  // Fetch user
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axiosInstance.get("/auth/check");
        setUser(response.data.message);
      } catch (error) {
        console.log("User not logged in", error);
        setUser(null);
      }
    }
    fetchData();
  }, []);

  // Fetch problem
  useEffect(() => {
    async function fetchProblem() {
      try {
        const response = await axiosInstance.get(`problems/${id}`);
        setProblem(response.data);
      } catch (err) {
        setError("Failed to load problem");
      } finally {
        setLoading(false);
      }
    }
    fetchProblem();
  }, [id]);

  const handleRunCode = async () => {
    setRunning(true);
    try {
      const response = await axiosInstance.post(`submissions/${id}/run`, {
        code: code[lang],
        lang,
      });
      setRunResults(response.data);
      setSelectedTestCase(0);
    } catch (error) {
      console.error("Error running code:", error);
    } finally {
      setRunning(false);
    }
  };

  const openSubmissionTab = (submission) => {
    setSelectedSubmission(submission);
    setSelectedTab("Submission Details");
  };

  const closeSubmissionTab = () => {
    setSelectedSubmission(null);
    setSelectedTab("Submissions"); // fallback tab
  };

  // Timer state and logic
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const startTimer = () => setIsRunning(true);
  const pauseTimer = () => setIsRunning(false);
  const resetTimer = () => {
    setIsRunning(false);
    setTimer(0);
  };

  const handleSubmitCode = async () => {
    setSubmitting(true);
    try {
      const response = await axiosInstance.post(`submissions/${id}`, {
        code: code[lang],
        language: lang,
      });
      setSelectedTab("Submissions");
      console.log(response.data);
      openSubmissionTab(response.data);
      setOutput(response.data);
    } catch (error) {
      console.error("Error submitting code:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-gray-400 p-6">Loading...</div>;
  if (error) return <div className="text-red-500 p-6">{error}</div>;

  return (
    <div className="h-full flex flex-col bg-[#1a1a1a] text-white">
      {/* Header */}
      <div className="sticky top-0 flex items-center justify-between md:px-10 px-3 py-2 border-b border-gray-800 bg-[#1a1a1a] z-50">
        {/* Left: Problems link */}
        <div className="flex items-center gap-4 pl-4 pr-4">
          <img
            src="/algoarena.svg"
            alt="AlgoArena"
            className="w-9 h-9 cursor-pointer"
            onClick={() => navigate("/")}
          />
          <div
            className="hover:text-white hover:underline text-lg underline-offset-4 transition duration-200 cursor-pointer"
            onClick={() => navigate("/problems")}
          >
            Problems
          </div>
        </div>

        {/* Center: Run & Submit */}
        <div className="flex items-center space-x-4">
          <button
            className={`px-4 py-2 rounded ${
              user
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-gray-600 cursor-not-allowed opacity-60"
            }`}
            onClick={user ? handleRunCode : null}
            disabled={!user || running || submitting}
            title={!user ? "Login to run your code" : ""}
          >
            {running ? "Running..." : "Run"}
          </button>

          <button
            className={`px-4 py-2 rounded ${
              user
                ? "bg-green-600 hover:bg-green-700"
                : "bg-gray-600 cursor-not-allowed opacity-60"
            }`}
            onClick={user ? handleSubmitCode : null}
            disabled={!user || submitting}
            title={!user ? "Login to submit your code" : ""}
          >
            {submitting ? "Submitting..." : "Submit"}
          </button>

          {!user && (
            <div className="text-white text-center py-2 hidden md:block">
              Please{" "}
              <span
                className="cursor-pointer text-blue-500 hover:text-blue-600 py-2"
                onClick={() => navigate("/login")}
              >
                Log in
              </span>{" "}
              to run or submit code.
            </div>
          )}
        </div>

        {/* Right: Timer + Profile */}
        <div className="hidden md:block">
          <div className="flex items-center space-x-6 pr-4">
            {/* Timer */}
            <div className="flex items-center space-x-3 px-3 py-1 rounded-lg">
              <span className="font-mono text-lg">
                {Math.floor(timer / 60)
                  .toString()
                  .padStart(2, "0")}
                :{(timer % 60).toString().padStart(2, "0")}
              </span>

              <div className="flex items-center space-x-2">
                {!isRunning ? (
                  <Play
                    className="h-5 w-5 text-gray-400 cursor-pointer hover:scale-110 transition-transform"
                    onClick={startTimer}
                  />
                ) : (
                  <Pause
                    className="h-5 w-5 text-gray-400 cursor-pointer hover:scale-110 transition-transform"
                    onClick={pauseTimer}
                  />
                )}
                <RotateCcw
                  className="h-5 w-5 text-gray-400 cursor-pointer hover:scale-110 transition-transform"
                  onClick={resetTimer}
                />
              </div>
            </div>

            {/* Profile */}
            {user && (
              <div
                className="flex items-center space-x-2 cursor-pointer"
                onClick={() => navigate("/profile")}
              >
                <span className="text-gray-200">{user.name}</span>
                <img
                  src={user.profilePicture}
                  alt="Profile"
                  className="h-8 w-8 rounded-full border border-gray-700"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="hidden md:flex flex-1 overflow-y-auto">
        <ResizablePanelGroup direction="horizontal" className="flex-1">
          <ResizablePanel
            defaultSize={40}
            minSize={30}
            className="border-r border-gray-800 h-full"
          >
            <ProblemDescription
              problem={problem}
              selectedTab={selectedTab}
              setSelectedTab={setSelectedTab}
              user={user}
              setSelectedSubmission={setSelectedSubmission}
              selectedSubmission={selectedSubmission}
              openSubmissionTab={openSubmissionTab}
              closeSubmissionTab={closeSubmissionTab}
              output={output}
            />
          </ResizablePanel>
          <ResizableHandle className="w-1 h-full bg-gray-800 hover:bg-gray-700 cursor-col-resize" />
          <ResizablePanel defaultSize={60} minSize={40}>
            <ResizablePanelGroup
              direction="vertical"
              className="h-full border-b border"
            >
              <ResizablePanel
                defaultSize={70}
                minSize={30}
                className="bg-[#1a1a1a]"
              >
                <CodeEditor
                  lang={lang}
                  setLang={setLang}
                  code={code}
                  setCode={setCode}
                />
              </ResizablePanel>
              <ResizableHandle className="h-1 w-full py-0.75 bg-gray-800 hover:bg-gray-700 cursor-row-resize" />
              <ResizablePanel
                defaultSize={30}
                minSize={20}
                className="bg-[#1a1a1a] flex flex-col overflow-y-auto"
              >
                <Testcases
                  problem={problem}
                  runResults={runResults}
                  selectedTestCase={selectedTestCase}
                  setSelectedTestCase={setSelectedTestCase}
                  isMobile={false}
                  user={user}
                />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Mobile Version */}
      <div className="flex md:hidden flex-col p-4 space-y-4 flex-1 mb-4 bg-[#1a1a1a]">
        <ProblemDescription
          problem={problem}
          selectedTab={selectedTab}
          setSelectedTab={setSelectedTab}
          user={user}
          setSelectedSubmission={setSelectedSubmission}
          selectedSubmission={selectedSubmission}
          openSubmissionTab={openSubmissionTab}
          closeSubmissionTab={closeSubmissionTab}
          output={output}
          isMobile={true}
        />

        {selectedTab === "Problem Details" && (
          <div className="bg-[#1a1a1a]">
            <div className="h-128">
              <CodeEditor
                lang={lang}
                setLang={setLang}
                code={code}
                setCode={setCode}
              />
            </div>

            <Testcases
              problem={problem}
              runResults={runResults}
              selectedTestCase={selectedTestCase}
              setSelectedTestCase={setSelectedTestCase}
              isMobile={true}
              user={user}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProblemDetails;
