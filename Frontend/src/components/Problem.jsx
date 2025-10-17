import React from "react";

const Problem = ({ problem, isSolved }) => {
  const difficultyColors = {
    Easy: "text-green-500",
    Medium: "text-yellow-500",
    Hard: "text-red-500",
  };

  return (
    <div className="grid grid-cols-3 md:grid-cols-4 gap-4 items-center p-3 rounded-lg hover:bg-[#272626] transition">
      {/* Title with status icon */}
      <h2 className="col-span-2 font-medium cursor-pointer flex items-center gap-2 hover:text-blue-400 relative">
        {/* Status icon */}
        <span className="w-5 flex-shrink-0 flex justify-center relative">
          {isSolved === "Solved" && (
            <svg
              aria-hidden="true"
              focusable="false"
              data-prefix="far"
              data-icon="check"
              className="svg-inline--fa fa-check h-[1em] text-green-500"
              role="img"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 448 512"
            >
              <path
                fill="currentColor"
                d="M441 103c9.4 9.4 9.4 24.6 0 33.9L177 401c-9.4 9.4-24.6 9.4-33.9 0L7 265c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l119 119L407 103c9.4-9.4 24.6-9.4 33.9 0z"
              ></path>
            </svg>
          )}
          {isSolved === "Attempted" && (
            <svg
              aria-hidden="true"
              focusable="false"
              data-prefix="far"
              data-icon="circle"
              className="svg-inline--fa fa-circle h-[0.7em] text-gray-500"
              role="img"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
            >
              <path
                fill="currentColor"
                d="M464 256A208 208 0 1 0 48 256a208 208 0 1 0 416 0zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256z"
              ></path>
            </svg>
          )}
        </span>

        {/* Problem title */}
        <span className="truncate">{problem.title}</span>
      </h2>

      {/* Difficulty */}
      <p
        className={`${difficultyColors[problem.difficulty] || "text-gray-400"} text-sm`}
      >
        {problem.difficulty}
      </p>

      {/* Tags */}
      <p className="hidden md:block text-sm text-gray-400 truncate">
        {problem.tags.join(", ")}
      </p>
    </div>
  );
};

export default Problem;
