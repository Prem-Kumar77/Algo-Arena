import React, { useState } from "react";
import axiosInstance from "@/utils/axios";
import { ThumbsUp, ThumbsDown, Send, MessageCircle } from "lucide-react";

const Discussions = ({ problem: initialProblem, user }) => {
  const [problem, setProblem] = useState(initialProblem);
  const [discussions, setDiscussions] = useState([]);
  const [newDiscussion, setNewDiscussion] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDiscussions, setShowDiscussions] = useState(false);
  const [expandedDiscussions, setExpandedDiscussions] = useState({});

  const toggleDiscussions = async () => {
    setShowDiscussions((prev) => !prev);
    if (!showDiscussions && problem?._id) {
      setLoading(true);
      try {
        const res = await axiosInstance.get(
          `/problems/${problem._id}/discussions`
        );
        setDiscussions(res.data);
      } catch (err) {
        console.error("Error fetching discussions:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAddDiscussion = async () => {
    if (!newDiscussion.trim()) return;
    try {
      const res = await axiosInstance.post(
        `/problems/${problem._id}/discussions`,
        { content: newDiscussion }
      );
      setDiscussions((prev) => [res.data, ...prev]);
      setNewDiscussion("");
    } catch (err) {
      console.error("Failed to add discussion:", err);
    }
  };

  const handleDiscussionLike = async (discussionId, type) => {
    try {
      const res = await axiosInstance.post(
        `/problems/${problem._id}/discussions/${discussionId}/${type}`
      );
      setDiscussions((prev) =>
        prev.map((d) => (d._id === discussionId ? res.data : d))
      );
    } catch (err) {
      console.error(`Failed to ${type} discussion:`, err);
    }
  };

  const handleAddComment = async (discussionId, content) => {
    if (!content.trim()) return;
    try {
      const res = await axiosInstance.post(
        `/problems/${problem._id}/discussions/${discussionId}/comments`,
        { content }
      );
      setDiscussions((prev) =>
        prev.map((d) =>
          d._id === discussionId
            ? { ...d, comments: [...d.comments, res.data] }
            : d
        )
      );
    } catch (err) {
      console.error("Failed to add comment:", err);
    }
  };

  const handleCommentLike = async (discussionId, commentId, type) => {
    try {
      const res = await axiosInstance.post(
        `/problems/${problem._id}/discussions/${discussionId}/comments/${commentId}/${type}`
      );
      setDiscussions((prev) =>
        prev.map((d) => (d._id === discussionId ? res.data : d))
      );
    } catch (err) {
      console.error(`Failed to ${type} comment:`, err);
    }
  };

  const handleProblemLike = async (type) => {
    try {
      const res = await axiosInstance.post(`/problems/${problem._id}/${type}`);
      setProblem(res.data);
    } catch (err) {
      console.error(`Failed to ${type} problem:`, err);
    }
  };

  return (
    <div className="mt-6 text-gray-200">
      <hr className="border-gray-700 mb-4" />

      <div className="flex flex-wrap items-center gap-4 mb-4">
        <button
          onClick={toggleDiscussions}
          className="flex items-center gap-2 font-medium"
        >
          <MessageCircle className="w-4 h-4" />
          {showDiscussions ? "Hide Discussions" : "Show Discussions"}
        </button>

        <div className="flex items-center gap-3 text-sm text-gray-400">
          <button
            onClick={() => handleProblemLike("like")}
            className={`flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-700 ${
              problem?.likes?.includes(user?._id) ? "text-green-500" : ""
            }`}
          >
            <ThumbsUp className="w-4 h-4" />
            <span>{problem?.likes?.length || 0}</span>
          </button>

          <button
            onClick={() => handleProblemLike("dislike")}
            className={`flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-700 ${
              problem?.dislikes?.includes(user?._id) ? "text-red-500" : "bg-a"
            }`}
          >
            <ThumbsDown className="w-4 h-4" />
            <span>{problem?.dislikes?.length || 0}</span>
          </button>
        </div>
      </div>

      {showDiscussions && (
        <>
          {loading ? (
            <p className="text-gray-400 mt-3">Loading discussions...</p>
          ) : (
            <div className="mt-4 space-y-4">
              {/* Add Discussion */}
              <div className="flex gap-2 border border-gray-700 rounded-lg">
                <textarea
                  value={newDiscussion}
                  onChange={(e) => setNewDiscussion(e.target.value)}
                  placeholder="Start a discussion..."
                  rows={3}
                  className="flex-1  rounded-lg p-2 text-sm text-gray-200 focus:outline-none resize-none shadow-sm"
                />
                <button
                  onClick={handleAddDiscussion}
                  className=" px-3 py-2 rounded-lg text-sm text-white flex items-center gap-1 hover:text-blue-500"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>

              {/* Discussions List */}
              {discussions.length === 0 ? (
                <p className="text-gray-500 text-sm">No discussions yet.</p>
              ) : (
                discussions.map((d) => (
                  <div
                    key={d._id}
                    className="border border-gray-700 rounded-lg p-3 shadow-sm"
                  >
                    <p className="text-sm mb-2 whitespace-pre-wrap">
                      {d.content}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                      <span className="font-medium">
                        by {d.author?.username}
                      </span>

                      <button
                        onClick={() => handleDiscussionLike(d._id, "like")}
                        className={`flex items-center gap-1 px-1 py-0.5 rounded hover:bg-gray-700 ${
                          d.likes?.includes(user?._id) ? "text-green-500" : ""
                        }`}
                      >
                        <ThumbsUp className="w-3 h-3" />
                        {d.likes?.length || 0}
                      </button>
                      <button
                        onClick={() => handleDiscussionLike(d._id, "dislike")}
                        className={`flex items-center gap-1 px-1 py-0.5 rounded hover:bg-gray-700 ${
                          d.dislikes?.includes(user?._id) ? "text-red-500" : ""
                        }`}
                      >
                        <ThumbsDown className="w-3 h-3" />
                        {d.dislikes?.length || 0}
                      </button>

                      <button
                        onClick={() =>
                          setExpandedDiscussions((prev) => ({
                            ...prev,
                            [d._id]: !prev[d._id],
                          }))
                        }
                        className="text-blue-400 hover:text-blue-500 font-medium"
                      >
                        {expandedDiscussions[d._id]
                          ? "Hide Comments"
                          : "View Comments"}
                      </button>
                    </div>

                    {/* Comments */}
                    {expandedDiscussions[d._id] && (
                      <div className="mt-3 ml-4 border-l border-gray-700 pl-4 space-y-2">
                        {d.comments?.map((c) => (
                          <div
                            key={c._id}
                            className="text-sm border border-gray-700 p-2 rounded-lg shadow-sm"
                          >
                            <p className="whitespace-pre-wrap">{c.content}</p>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400 mt-1">
                              <span className="font-medium">
                                {c.author?.username}
                              </span>
                              <button
                                onClick={() =>
                                  handleCommentLike(d._id, c._id, "like")
                                }
                                className={`flex items-center gap-1 px-1 py-0.5 rounded hover:bg-gray-700 ${
                                  c.likes?.includes(user?._id)
                                    ? "text-green-500"
                                    : ""
                                }`}
                              >
                                <ThumbsUp className="w-3 h-3" />
                                {c.likes?.length || 0}
                              </button>
                              <button
                                onClick={() =>
                                  handleCommentLike(d._id, c._id, "dislike")
                                }
                                className={`flex items-center gap-1 px-1 py-0.5 rounded hover:bg-gray-700 ${
                                  c.dislikes?.includes(user?._id)
                                    ? "text-red-500"
                                    : ""
                                }`}
                              >
                                <ThumbsDown className="w-3 h-3" />
                                {c.dislikes?.length || 0}
                              </button>
                            </div>
                          </div>
                        ))}

                        <AddCommentForm
                          onSubmit={(content) =>
                            handleAddComment(d._id, content)
                          }
                        />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

const AddCommentForm = ({ onSubmit }) => {
  const [comment, setComment] = useState("");
  return (
    <div className="flex flex-col gap-2 mt-2">
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Write a comment..."
        rows={2}
        className="flex-1 border border-gray-700 rounded-lg p-3 text-xs text-gray-300 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
      />
      <button
        onClick={() => {
          onSubmit(comment);
          setComment("");
        }}
        className="text-xs text-blue-400 hover:text-blue-500 self-start font-medium"
      >
        Add Comment
      </button>
    </div>
  );
};

export default Discussions;
