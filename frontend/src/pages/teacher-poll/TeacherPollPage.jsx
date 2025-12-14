
import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import io from "socket.io-client";
// import ChatPopover from "../../components/chat/ChatPopover.jsx";
import ChatPopover from "../../components/chat/ChatPopover.jsx";


import { useNavigate } from "react-router-dom";
import eyeIcon from "../../assets/eye.svg"; // Ensure this path is correct
import "./TeacherPollPage.css"; // Ensure CSS is imported

let apiUrl = import.meta.env.VITE_API_BASE_URL;
const socket = io(apiUrl);

const TeacherPollPage = () => {
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState([]);
  const [votes, setVotes] = useState({});
  const [totalVotes, setTotalVotes] = useState(0);
  const navigate = useNavigate(); // FIXED: Removed 'new' keyword

  useEffect(() => {
    socket.on("pollCreated", (pollData) => {
      setPollQuestion(pollData.question);
      setPollOptions(pollData.options);
      setVotes({});
      setTotalVotes(0);
    });

    socket.on("pollResults", (updatedVotes) => {
      setVotes(updatedVotes);
      setTotalVotes(Object.values(updatedVotes).reduce((a, b) => a + b, 0));
    });

    return () => {
      socket.off("pollCreated");
      socket.off("pollResults");
    };
  }, []);

  const calculatePercentage = (count) => {
    if (totalVotes === 0) return 0;
    return Math.round((count / totalVotes) * 100);
  };

  const askNewQuestion = () => {
    navigate("/teacher-home-page");
  };

  const handleViewPollHistory = () => {
    navigate("/teacher-poll-history");
  };

  return (
    <div className="container mt-4" style={{ maxWidth: "800px" }}>
      {/* Header Section */}
      <div className="d-flex justify-content-end mb-5">
        <button
          className="btn rounded-pill poll-history-btn px-4 d-flex align-items-center gap-2"
          onClick={handleViewPollHistory}
        >
          {/* Use an inline SVG or your img tag here */}
          <img src={eyeIcon} alt="" width="20" /> 
          View Poll history
        </button>
      </div>

      <div className="w-100">
        <h5 className="mb-3 fw-bold">Question</h5>

        {pollQuestion ? (
          <>
            <div className="card shadow-sm border-0 overflow-hidden rounded-4">
              {/* Dark Header for Question */}
              <div className="question-header p-4 text-white">
                <h5 className="m-0 fw-normal">{pollQuestion}</h5>
              </div>

              {/* Options Body */}
              <div className="card-body p-4 bg-light-gray">
                <div className="d-flex flex-column gap-3">
                  {pollOptions.map((option, index) => {
                    const voteCount = votes[option.text] || 0;
                    const percentage = calculatePercentage(voteCount);
                    const isHighContrast = percentage > 50; // Text turns white if bar is > 50%

                    return (
                      <div
                        key={option.id}
                        className="option-card position-relative overflow-hidden rounded-3 border"
                      >
                        {/* Background Progress Bar */}
                        <div
                          className="progress-bg"
                          style={{ width: `${percentage}%` }}
                        ></div>

                        {/* Content Overlay */}
                        <div className="option-content position-relative d-flex justify-content-between align-items-center p-3 px-4">
                          <div className="d-flex align-items-center gap-3">
                            <span
                              className={`option-circle d-flex align-items-center justify-content-center fw-bold ${
                                isHighContrast ? "bg-white text-purple" : "bg-purple text-white"
                              }`}
                            >
                              {index + 1}
                            </span>
                            <span
                              className={`fw-bold ${
                                isHighContrast ? "text-white" : "text-dark"
                              }`}
                            >
                              {option.text}
                            </span>
                          </div>
                          <span
                            className={`fw-bold ${
                              isHighContrast ? "text-white" : "text-dark"
                            }`}
                          >
                            {percentage}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer Button */}
            <div className="d-flex justify-content-end mt-4">
              <button
                className="btn rounded-pill ask-new-btn px-4 py-2 fw-bold"
                onClick={askNewQuestion}
              >
                + Ask a new question
              </button>
            </div>
          </>
        ) : (
          <div className="text-center text-muted mt-5">
             <div className="spinner-border text-purple mb-3" role="status"></div>
             <p>Waiting for the teacher to start a new poll...</p>
          </div>
        )}

        <ChatPopover />
      </div>
    </div>
  );
};

export default TeacherPollPage;