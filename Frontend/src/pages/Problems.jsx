import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import axiosInstance from "../utils/axios";
import Problem from "../components/Problem";
import { Link } from "react-router-dom";
import Select from "react-select";

const Problems = () => {
  const [problems, setProblems] = useState([]);
  const [submissions, setSubmissions] = useState({});
  const [filteredProblems, setFilteredProblems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();

  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [selectedTags, setSelectedTags] = useState([]);
  const [allTags, setAllTags] = useState([]);

  const repeatArray = (arr, times) => Array(times).fill(arr).flat();

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        // Fetch problems
        const problemsResponse = await axiosInstance.get("problems/");
        const problemsList = problemsResponse.data;
        setProblems(problemsList);
        setFilteredProblems(problemsList);

        // Fetch tags
        const tagsSet = new Set();
        problemsList.forEach((p) => p.tags.forEach((t) => tagsSet.add(t)));
        setAllTags(["All", ...Array.from(tagsSet)]);

        // Try fetching user submissions (optional)
        try {
          const submissionsResponse =
            await axiosInstance.get("/submissions/user");
          const subs = submissionsResponse.data;

          const submissionsMap = {};
          subs.forEach((sub) => {
            if (sub.verdict === "Accepted") {
              submissionsMap[sub.problem] = "Solved";
            } else if (!(sub.problem in submissionsMap)) {
              submissionsMap[sub.problem] = "Attempted";
            }
          });

          setSubmissions(submissionsMap);
        } catch (subErr) {
          // User not logged in or fetch failed
          console.log("No user submissions available:", subErr.message);
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Error fetching problems"
        );
        console.error("Error fetching problems:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  useEffect(() => {
    if (problems.length === 0) return;
    let filtered = [...problems];

    if (selectedDifficulty !== "All") {
      filtered = filtered.filter(
        (problem) => problem.difficulty === selectedDifficulty
      );
    }

    if (selectedTags.length > 0) {
      filtered = filtered.filter((problem) =>
        problem.tags.some((tag) => selectedTags.includes(tag))
      );
    }

    setFilteredProblems(filtered);
  }, [selectedDifficulty, selectedTags, problems]);

  const tagOptions = allTags
    .filter((tag) => tag !== "All") // remove "All" since we’ll handle reset separately
    .map((tag) => ({ value: tag, label: tag }));

  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col">
      <Navbar />
      <div className="flex-grow max-w-5xl w-full mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Problems</h1>

        <div className="flex flex-col sm:flex-row gap-4 mb-6 items-start sm:items-center">
          {/* Difficulty Dropdown */}
          <select
            className="bg-[#1a1a1a] border border-gray-700 rounded px-3 py-2 w-full sm:w-40 h-10"
            value={selectedDifficulty}
            onChange={(e) => {
              const value = e.target.value;
              setSelectedDifficulty(value);
              if (value === "All") setFilteredProblems(problems);
            }}
          >
            {["All", "Easy", "Medium", "Hard"].map((difficulty) => (
              <option key={difficulty} value={difficulty}>
                {difficulty}
              </option>
            ))}
          </select>

          {/* Tags Multi-Select */}
          <div className="w-full sm:w-80">
            <Select
              isMulti
              name="tags"
              options={tagOptions}
              className="text-black"
              classNamePrefix="select"
              placeholder="Filter by Tags..."
              value={tagOptions.filter((option) =>
                selectedTags.includes(option.value)
              )}
              onChange={(selectedOptions) => {
                const values = selectedOptions
                  ? selectedOptions.map((opt) => opt.value)
                  : [];
                setSelectedTags(values);
              }}
              styles={{
                control: (base) => ({
                  ...base,
                  backgroundColor: "#1a1a1a",
                  borderColor: "#333",
                  color: "white",
                  minHeight: "40px",
                }),
                valueContainer: (base) => ({
                  ...base,
                  maxHeight: "38px",
                  overflowY: "auto",
                  display: "flex",
                  flexWrap: "wrap",
                }),
                menu: (base) => ({
                  ...base,
                  backgroundColor: "#1a1a1a",
                  color: "white",
                }),
                multiValue: (base) => ({
                  ...base,
                  backgroundColor: "#333",
                  color: "white",
                }),
                multiValueLabel: (base) => ({ ...base, color: "white" }),
                multiValueRemove: (base) => ({
                  ...base,
                  color: "#ccc",
                  ":hover": { backgroundColor: "#333", color: "white" },
                }),
                input: (base) => ({ ...base, color: "white" }),
                option: (base, { isFocused, isSelected }) => ({
                  ...base,
                  backgroundColor: isSelected
                    ? "#1e40af"
                    : isFocused
                      ? "#1e40af"
                      : "transparent",
                  color: isSelected || isFocused ? "white" : "#ccc",
                  cursor: "pointer",
                }),
              }}
            />
          </div>

          {/* Reset Button */}
          <button
            onClick={() => {
              setSelectedDifficulty("All");
              setSelectedTags([]);
              setFilteredProblems(problems);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded w-full sm:w-auto h-10"
          >
            Reset
          </button>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-4 gap-4 items-center text-gray-400 border-b border-gray-700 pb-2 mb-4 text-sm font-medium p-3">
          {/* Title column with reserved tick space */}
          <div className="col-span-2 flex items-center gap-2">
            <span className="w-5 flex-shrink-0"></span>{" "}
            {/* reserve tick space */}
            <span>Title</span>
          </div>

          <p>Difficulty</p>
          <p className="hidden md:block">Tags</p>
        </div>

        <div>
          {loading ? (
            <div className="flex items-center justify-center py-20 text-gray-400">
              Loading problems...
            </div>
          ) : error ? (
            <div className="text-red-400 py-6">{error}</div>
          ) : problems.length === 0 ? (
            <div className="text-gray-100 py-6">No problems available.</div>
          ) : (
            <div className="space-y-2">
              {filteredProblems.map((problem, index) => (
                <Link
                  to={`/problem/${problem._id}`}
                  key={problem._id + index}
                  className={`block ${
                    index % 2 === 0 ? "bg-[#1a1a1a]" : "bg-[#121212]"
                  } rounded-md`}
                >
                  <Problem
                    problem={problem}
                    isSolved={submissions[problem._id]}
                  />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Problems;
