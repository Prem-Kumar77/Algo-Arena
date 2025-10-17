import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, use } from "react";
import axiosInstance from "../utils/axios";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

import ProblemDescription from "@/components/ProblemDetails/ProblemDescription.jsx";
import CodeEditor from "@/components/ProblemDetails/CodeEditor.jsx";
import Testcases from "@/components/ProblemDetails/Testcases.jsx";

const ContestProblemPage = () => {
  const { id, contestId } = useParams();
  const [problem, setProblem] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();
  const [lang, setLang] = useState("cpp");
  const [selectedTestCase, setSelectedTestCase] = useState(0);
  const [isRegistered, setIsRegistered] = useState(false);
  const [code, setCode] = useState({
    cpp: "// C++ code here",
    python: "# Python code here",
    javascript: "// JavaScript code here",
    java: "// Java code here",
  });
  const [running, setRunning] = useState(false);
  const [runResults, setRunResults] = useState([]);
  const [submitting, setSubmitting] = useState();
  const [output, setOutput] = useState();
  const [selectedTab, setSelectedTab] = useState("Problem Details");
  const [user, setUser] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [contest, setContest] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0); // in seconds

  const navigate = useNavigate();

  const openSubmissionTab = (submission) => {
    setSelectedSubmission(submission);
    setSelectedTab("Submission Details");
  };

  const closeSubmissionTab = () => {
    setSelectedSubmission(null);
    setSelectedTab("Submissions"); // fallback tab
  };

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

  useEffect(() => {
    async function fetchContest() {
      try {
        const response = await axiosInstance.get(`/contests/${contestId}`);
        const contestData = response.data.contest || response.data;
        setContest(contestData);
        setIsRegistered(response.data.isRegistered);
        const endTime = new Date(contestData.endTime).getTime();
        const now = Date.now();
        setTimeLeft(Math.max(0, Math.floor((endTime - now) / 1000)));
      } catch (err) {
        console.error("Failed to load contest:", err);
      }
    }
    fetchContest();
  }, [contestId]);

  useEffect(() => {
    if (!contest) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const endTime = new Date(contest.endTime).getTime();
      const diff = Math.max(0, endTime - now); // difference in ms
      setTimeLeft(Math.floor(diff / 1000)); // convert to seconds
    }, 1000);

    return () => clearInterval(interval);
  }, [contest]);

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

  const handleSubmitCode = async () => {
    setSubmitting(true);
    try {
      const response = await axiosInstance.post(
        `contests/${contestId}/problem/${id}/submit`,
        {
          code: code[lang],
          language: lang,
        }
      );

      setSelectedTab("Submissions");
      setOutput(response.data.submission);
      console.log(response.data);
      openSubmissionTab(response.data.submission);
    } catch (error) {
      console.error("Error submitting code:", error);
    } finally {
      setSubmitting(false);
    }
  };

  // const [timer, setTimer] = useState(0);
  // const [isRunning, setIsRunning] = useState();

  // useEffect(() => {
  //   let interval;
  //   if (isRunning) {
  //     interval = setInterval(() => {
  //       setTimer((prev) => prev + 1);
  //     }, 1000);
  //   }

  //   return () => clearInterval(interval);
  // }, [isRunning]);

  // const startTimer = () => setIsRunning(true);
  // const pauseTimer = () => setIsRunning(false);
  // const resetTimer = () => setTimer(0);

  if (loading) return <div className="text-gray-400 p-6">Loading...</div>;
  if (error) return <div className="text-red-500 p-6">{error}</div>;

  return (
    <div className="h-full flex flex-col bg-[#1a1a1a] text-white">
      <div className="sticky top-0 flex items-center justify-between px-10 py-2 border-b border-gray-800 bg-[#1a1a1a] z-50">
        {/* Left: Problems link */}
        <div className="flex items-center gap-4 pl-4 pr-4">
          <svg
            width="95"
            height="111"
            viewBox="0 0 95 111"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-8 h-8 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <path
              d="M68.0063 83.0664C70.5 80.5764 74.5366 80.5829 77.0223 83.0809C79.508 85.579 79.5015 89.6226 77.0078 92.1127L65.9346 103.17C55.7187 113.371 39.06 113.519 28.6718 103.513C28.6117 103.456 23.9861 98.9201 8.72653 83.957C-1.42528 74.0029 -2.43665 58.0749 7.11648 47.8464L24.9282 28.7745C34.4095 18.6219 51.887 17.5122 62.7275 26.2789L78.9048 39.362C81.6444 41.5776 82.0723 45.5985 79.8606 48.3429C77.6488 51.0873 73.635 51.5159 70.8954 49.3003L54.7182 36.2173C49.0488 31.6325 39.1314 32.2622 34.2394 37.5006L16.4274 56.5727C11.7767 61.5522 12.2861 69.574 17.6456 74.8292C28.851 85.8169 37.4869 94.2846 37.4969 94.2942C42.8977 99.496 51.6304 99.4184 56.9331 94.1234L68.0063 83.0664Z"
              fill="#FFA116"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M41.1067 72.0014C37.5858 72.0014 34.7314 69.1421 34.7314 65.615C34.7314 62.0879 37.5858 59.2286 41.1067 59.2286H88.1245C91.6454 59.2286 94.4997 62.0879 94.4997 65.615C94.4997 69.1421 91.6454 72.0014 88.1245 72.0014H41.1067Z"
              fill="#B3B3B3"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M49.9118 2.02335C52.3173 -0.55232 56.3517 -0.686894 58.9228 1.72277C61.494 4.13244 61.6284 8.17385 59.2229 10.7495L16.4276 56.5729C11.7768 61.552 12.2861 69.5738 17.6453 74.8292L37.4088 94.2091C39.9249 96.6764 39.968 100.72 37.505 103.24C35.042 105.761 31.0056 105.804 28.4895 103.337L8.72593 83.9567C-1.42529 74.0021 -2.43665 58.0741 7.1169 47.8463L49.9118 2.02335Z"
              fill="white"
            />
          </svg>
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
              user && isRegistered && timeLeft > 0
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-gray-600 opacity-60"
            }`}
            onClick={user ? handleRunCode : null}
            disabled={
              !user || running || submitting || timeLeft <= 0 || !isRegistered
            }
            title={!user ? "Login to run your code" : ""}
          >
            {running ? "Running..." : "Run"}
          </button>

          <button
            className={`px-4 py-2 rounded ${
              user && isRegistered && timeLeft > 0
                ? "bg-green-600 hover:bg-green-700"
                : "bg-gray-600 opacity-60"
            }
            }
            
            `}
            onClick={user ? handleSubmitCode : null}
            disabled={!user || submitting || timeLeft <= 0 || !isRegistered}
            title={!user ? "Login to submit your code" : ""}
          >
            {submitting ? "Submitting..." : "Submit"}
          </button>

          {!user && (
            <div className="text-white text-center py-2">
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
        <div className="flex items-center space-x-6 pr-4">
          {/* Timer */}
          <div className="flex items-center space-x-3 px-3 py-1 rounded-lg">
            <span className="font-mono text-lg">
              {String(Math.floor(timeLeft / 3600)).padStart(2, "0")}:
              {String(Math.floor((timeLeft % 3600) / 60)).padStart(2, "0")}:
              {String(timeLeft % 60).padStart(2, "0")}
            </span>
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
      {/* Desktop Version */}
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
              inContest={true}
              isMobile={false}
            />
          </ResizablePanel>
          <ResizableHandle className="w-1 bg-gray-800 hover:bg-gray-700 cursor-col-resize" />
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
              <ResizableHandle className="width-1 bg-gray-800 hover:bg-gray-700 cursor-col-resize h-2" />
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
          inContest={true}
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
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ContestProblemPage;
