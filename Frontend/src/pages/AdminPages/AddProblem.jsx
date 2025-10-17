import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/utils/axios";

const AddProblem = () => {
  const navigate = useNavigate();

  // Basic fields
  const [formData, setFormData] = useState({
    title: "",
    difficulty: "Easy",
    description: "",
    constraints: "",
    tags: "",
    active: true,
  });

  // Examples & TestCases
  const [examples, setExamples] = useState([
    { input: "", output: "", explanation: "" },
  ]);
  const [testCases, setTestCases] = useState([
    { input: "", output: "", hidden: false },
  ]);

  // JSON editing
  const [examplesJSON, setExamplesJSON] = useState(
    JSON.stringify(examples, null, 2)
  );
  const [testCasesJSON, setTestCasesJSON] = useState(
    JSON.stringify(testCases, null, 2)
  );

  // Toggle between JSON & form view
  const [examplesJsonMode, setExamplesJsonMode] = useState(false);
  const [testCasesJsonMode, setTestCasesJsonMode] = useState(false);

  const [examplesError, setExamplesError] = useState("");
  const [testCasesError, setTestCasesError] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Form input change
  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Examples & TestCases handlers
  const handleExampleChange = (idx, field, value) => {
    const newExamples = [...examples];
    newExamples[idx][field] = value;
    setExamples(newExamples);
    setExamplesJSON(JSON.stringify(newExamples, null, 2));
  };

  const addExample = () => {
    const newExamples = [
      ...examples,
      { input: "", output: "", explanation: "" },
    ];
    setExamples(newExamples);
    setExamplesJSON(JSON.stringify(newExamples, null, 2));
  };

  const removeExample = (idx) => {
    const newExamples = examples.filter((_, i) => i !== idx);
    setExamples(newExamples);
    setExamplesJSON(JSON.stringify(newExamples, null, 2));
  };

  const handleTestCaseChange = (idx, field, value) => {
    const newTestCases = [...testCases];
    newTestCases[idx][field] = value;
    setTestCases(newTestCases);
    setTestCasesJSON(JSON.stringify(newTestCases, null, 2));
  };

  const addTestCase = () => {
    const newTestCases = [
      ...testCases,
      { input: "", output: "", hidden: false },
    ];
    setTestCases(newTestCases);
    setTestCasesJSON(JSON.stringify(newTestCases, null, 2));
  };

  const removeTestCase = (idx) => {
    const newTestCases = testCases.filter((_, i) => i !== idx);
    setTestCases(newTestCases);
    setTestCasesJSON(JSON.stringify(newTestCases, null, 2));
  };

  // JSON mode handlers
  const handleExamplesJSONChange = (e) => {
    const value = e.target.value;
    setExamplesJSON(value);
    try {
      const parsed = JSON.parse(value);
      if (!Array.isArray(parsed)) throw new Error("Must be an array");
      setExamples(parsed);
      setExamplesError("");
    } catch (err) {
      setExamplesError(err.message);
    }
  };

  const handleTestCasesJSONChange = (e) => {
    const value = e.target.value;
    setTestCasesJSON(value);
    try {
      const parsed = JSON.parse(value);
      if (!Array.isArray(parsed)) throw new Error("Must be an array");
      setTestCases(parsed);
      setTestCasesError("");
    } catch (err) {
      setTestCasesError(err.message);
    }
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (examplesError || testCasesError) {
      setMessage("Fix JSON errors before submitting!");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      await axiosInstance.post("/problems/create", {
        ...formData,
        examples,
        constraints: formData.constraints.split("\n").filter(Boolean),
        testCases,
        tags: formData.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      });

      setMessage("Problem added successfully!");
      setTimeout(() => navigate("/admin/manage-problems"), 1000);
    } catch (err) {
      console.error(err);
      setMessage("Failed to add problem");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6 text-white">
        Add New Problem
      </h1>
      {message && (
        <p
          className={`mb-4 font-medium ${message.includes("successfully") ? "text-green-400" : "text-red-400"}`}
        >
          {message}
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-[#1f1f1f] p-6 rounded-2xl space-y-4 shadow-lg"
      >
        {/* Title */}
        <div>
          <label className="block text-gray-300 mb-1">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full p-2 rounded bg-[#2a2a2a] text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Difficulty */}
        <div>
          <label className="block text-gray-300 mb-1">Difficulty</label>
          <select
            name="difficulty"
            value={formData.difficulty}
            onChange={handleChange}
            className="w-full p-2 rounded bg-[#2a2a2a] text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        {/* Active/Inactive */}
        <input
          type="checkbox"
          name="active"
          checked={formData.active}
          onChange={handleChange}
          className="w-5 h-5 accent-blue-500"
        />

        {/* Description */}
        <div>
          <label className="block text-gray-300 mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-2 rounded bg-[#2a2a2a] text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows="4"
            required
          />
        </div>

        {/* Examples */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-gray-300">Examples</label>
            <button
              type="button"
              className="text-sm text-blue-400 underline"
              onClick={() => setExamplesJsonMode(!examplesJsonMode)}
            >
              {examplesJsonMode ? "Classic View" : "JSON View"}
            </button>
          </div>

          {examplesJsonMode ? (
            <div>
              <textarea
                value={examplesJSON}
                onChange={handleExamplesJSONChange}
                className="w-full p-2 rounded bg-[#2a2a2a] text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono"
                rows="8"
              />
              {examplesError && (
                <p className="text-red-400 text-sm mt-1">{examplesError}</p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {examples.map((ex, idx) => (
                <div key={idx} className="relative space-y-1">
                  <textarea
                    value={ex.input}
                    onChange={(e) =>
                      handleExampleChange(idx, "input", e.target.value)
                    }
                    className="w-full p-2 rounded bg-[#2a2a2a] text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows="3"
                    placeholder="Input (multi-line)"
                  />
                  <textarea
                    value={ex.output}
                    onChange={(e) =>
                      handleExampleChange(idx, "output", e.target.value)
                    }
                    className="w-full p-2 rounded bg-[#2a2a2a] text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows="2"
                    placeholder="Output"
                  />
                  <textarea
                    value={ex.explanation}
                    onChange={(e) =>
                      handleExampleChange(idx, "explanation", e.target.value)
                    }
                    className="w-full p-2 rounded bg-[#2a2a2a] text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows="2"
                    placeholder="Explanation (optional)"
                  />
                  <button
                    type="button"
                    onClick={() => removeExample(idx)}
                    className="absolute top-0 right-0 p-1 text-white hover:text-red-400"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addExample}
                className="text-blue-500 hover:underline text-sm"
              >
                + Add Example
              </button>
            </div>
          )}
        </div>

        {/* Constraints */}
        <div>
          <label className="block text-gray-300 mb-1">Constraints</label>
          <textarea
            name="constraints"
            value={formData.constraints}
            onChange={handleChange}
            className="w-full p-2 rounded bg-[#2a2a2a] text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows="3"
            placeholder="One constraint per line"
          />
        </div>

        {/* Test Cases */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-gray-300">Test Cases</label>
            <button
              type="button"
              className="text-sm text-blue-400 underline"
              onClick={() => setTestCasesJsonMode(!testCasesJsonMode)}
            >
              {testCasesJsonMode ? "Classic View" : "JSON View"}
            </button>
          </div>

          {testCasesJsonMode ? (
            <div>
              <textarea
                value={testCasesJSON}
                onChange={handleTestCasesJSONChange}
                className="w-full p-2 rounded bg-[#2a2a2a] text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono"
                rows="8"
              />
              {testCasesError && (
                <p className="text-red-400 text-sm mt-1">{testCasesError}</p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {testCases.map((tc, idx) => (
                <div key={idx} className="relative space-y-1">
                  <textarea
                    value={tc.input}
                    onChange={(e) =>
                      handleTestCaseChange(idx, "input", e.target.value)
                    }
                    className="w-full p-2 rounded bg-[#2a2a2a] text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows="3"
                    placeholder="Input (multi-line)"
                  />
                  <textarea
                    value={tc.output}
                    onChange={(e) =>
                      handleTestCaseChange(idx, "output", e.target.value)
                    }
                    className="w-full p-2 rounded bg-[#2a2a2a] text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows="2"
                    placeholder="Output"
                  />
                  <button
                    type="button"
                    onClick={() => removeTestCase(idx)}
                    className="absolute top-0 right-0 p-1 text-white hover:text-red-400"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addTestCase}
                className="text-blue-500 hover:underline text-sm"
              >
                + Add Test Case
              </button>
            </div>
          )}
        </div>

        {/* Tags */}
        <div>
          <label className="block text-gray-300 mb-1">
            Tags (comma separated)
          </label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            className="w-full p-2 rounded bg-[#2a2a2a] text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading || examplesError || testCasesError}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
        >
          {loading ? "Adding..." : "Add Problem"}
        </button>
      </form>
    </div>
  );
};

export default AddProblem;
