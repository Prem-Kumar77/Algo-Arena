import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Problems from "./pages/Problems";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import ProblemDetails from "./pages/ProblemDetails";
import Contests from "./pages/Contests";
import ContestDetails from "./pages/ContestDetails";
import ContestProblemPage from "./pages/ContestProblemPage";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminPages/AdminDashboard";
import ManageProblems from "./pages/AdminPages/ManageProblems";
import AddProblem from "./pages/AdminPages/AddProblem";
import EditProblem from "./pages/AdminPages/EditProblem";
import ManageContests from "./pages/AdminPages/ManageContests";
import AddContest from "./pages/AdminPages/AddContest";
import EditContest from "./pages/AdminPages/EditContest";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/problems" element={<Problems />} />
        <Route path="/problem/:id" element={<ProblemDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/contests" element={<Contests />} />
        <Route path="/contests/:contestId" element={<ContestDetails />} />
        <Route
          path="/contests/:contestId/leaderboard"
          element={<Leaderboard />}
        />
        <Route
          path="/contests/:contestId/problem/:id"
          element={<ContestProblemPage />}
        />

        {/* Admin routes */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="admin/manage-problems" element={<ManageProblems />} />
        <Route path="admin/add-problem" element={<AddProblem />} />
        <Route path="admin/edit-problem/:id" element={<EditProblem />} />
        <Route path="admin/manage-contests" element={<ManageContests />} />
        <Route path="admin/add-contest" element={<AddContest />} />
        <Route path="admin/edit-contest/:id" element={<EditContest />} />
      </Routes>
    </Router>
  );
};

export default App;
