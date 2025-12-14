import { BrowserRouter, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/login-page/LoginPage";
import TeacherLandingPage from "./pages/teacher-landing/TeacherLandingPage";
import StudentLandingPage from "./pages/student-landing/StudentLandingPage";
import StudentPollPage from "./pages/student-poll/StudentPollPage";
import TeacherPollPage from "./pages/teacher-poll/TeacherPollPage";
import PollHistoryPage from "./pages/poll-history/PollHistory";
import TeacherProtectedRoute from "./components/route-protect/TeacherProtect";
import StudentProtectedRoute from "./components/route-protect/StudentProtect";
import KickedOutPage from "./pages/kicked-out/KickedOutPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route
          path="/teacher-home-page"
          element={
            <TeacherProtectedRoute>
              <TeacherLandingPage />
            </TeacherProtectedRoute>
          }
        />
        <Route path="/student-home-page" element={<StudentLandingPage />} />

        <Route
          path="/poll-question"
          element={
            <StudentProtectedRoute>
              <StudentPollPage />
            </StudentProtectedRoute>
          }
        />
        <Route
          path="/teacher-poll"
          element={
            <TeacherProtectedRoute>
              <TeacherPollPage />
            </TeacherProtectedRoute>
          }
        />
        <Route
          path="/teacher-poll-history"
          element={
            <TeacherProtectedRoute>
              <PollHistoryPage />
            </TeacherProtectedRoute>
          }
        />
        <Route path="/kicked-out" element={<KickedOutPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;