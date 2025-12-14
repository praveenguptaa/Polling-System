
import React, { useState, useEffect, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import io from "socket.io-client";
import "./StudentPollPage.css";
import stopwatch from "../../assets/stopwatch.svg";
// import ChatPopover from "../../components/chat/ChatPopover";
import ChatPopover from "../../components/chat/ChatPopover.jsx";
import { useNavigate } from "react-router-dom";
import stars from "../../assets/spark.svg";

let apiUrl = import.meta.env.VITE_API_BASE_URL;
const socket = io(apiUrl);

const StudentPollPage = () => {
  const [votes, setVotes] = useState({});
  const [selectedOption, setSelectedOption] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState([]);
  const [pollId, setPollId] = useState("");
  const [kickedOut, setKickedOut] = useState(false);
  const timerRef = useRef(null);
  const navigate = useNavigate();

  const totalVotes = Object.values(votes).reduce((a, b) => a + b, 0);

  // --- Handlers ---
  const handleOptionSelect = (option) => {
    if (!submitted && timeLeft > 0) {
      setSelectedOption(option);
    }
  };

  const handleSubmit = () => {
    if (selectedOption) {
      const username = sessionStorage.getItem("username");
      if (username) {
        socket.emit("submitAnswer", {
          username: username,
          option: selectedOption,
          pollId: pollId,
        });
        setSubmitted(true);
      }
    }
  };

  // --- Effect: Handle Kick Out ---
  useEffect(() => {
    const handleKickedOut = () => {
      // 1. Update State (Optional if navigating immediately)
      setKickedOut(true);
      
      // 2. Clear Session
      sessionStorage.removeItem("username");
      
      // 3. Redirect to the Kicked Out Page
      navigate("/kicked-out");
    };

    socket.on("kickOut", handleKickedOut);

    return () => {
      socket.off("kickOut", handleKickedOut);
    };
  }, [navigate]);

  // --- Effect: Poll Data & Timer ---
  useEffect(() => {
    socket.on("pollCreated", (pollData) => {
      setPollQuestion(pollData.question);
      setPollOptions(pollData.options);
      setVotes({});
      setSubmitted(false);
      setSelectedOption(null);
      setTimeLeft(pollData.timer);
      setPollId(pollData._id);
    });

    socket.on("pollResults", (updatedVotes) => {
      setVotes(updatedVotes);
    });

    return () => clearInterval(timerRef.current);
  }, []);

  // --- Effect: Countdown Logic ---
  useEffect(() => {
    if (timeLeft > 0 && !submitted) {
      clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setSubmitted(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [timeLeft, submitted]);

  const calculatePercentage = (count) => {
    if (totalVotes === 0) return 0;
    return Math.round((count / totalVotes) * 100);
  };

  // --- RENDER HELPERS ---

  // 1. Kicked Out Screen (Fallback if navigation delays)
  if (kickedOut) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-white">
        <div className="poll-badge mb-4">
          <img src={stars} alt="" className="me-2" /> Intervue Poll
        </div>
        <h2 className="fw-bold mb-3">You’ve been Kicked out !</h2>
        <p className="text-muted text-center" style={{ maxWidth: "400px" }}>
          Looks like the teacher had removed you from the poll system. Please Try
          again sometime.
        </p>
      </div>
    );
  }

  // 2. Waiting Screen
  if (!pollQuestion) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-white">
        <div className="poll-badge mb-5">
          <img src={stars} alt="" className="me-2" /> Intervue Poll
        </div>
        <div className="spinner-border text-purple mb-4" role="status" style={{width: '3rem', height: '3rem'}}></div>
        <h3 className="fw-bold">Wait for the teacher to ask questions..</h3>
        <ChatPopover />
      </div>
    );
  }

  // 3. Active Poll / Results Screen
  const isResultView = submitted || timeLeft === 0;

  return (
    <div className="container mt-5" style={{ maxWidth: "700px" }}>
      {/* Header: Question Number & Timer */}
      <div className="d-flex align-items-center gap-3 mb-3">
        <h4 className="fw-bold m-0">Question 1</h4>
        {timeLeft > 0 && (
          <div className="d-flex align-items-center text-danger fw-bold bg-light-red px-2 py-1 rounded">
            <img src={stopwatch} alt="" width="16" className="me-2" />
            00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
          </div>
        )}
      </div>

      {/* Question Card */}
      <div className="card border-0 shadow-sm overflow-hidden rounded-4">
        {/* Question Header */}
        <div className="question-header p-4 text-white">
          <h5 className="m-0">{pollQuestion}</h5>
        </div>

        {/* Options Body */}
        <div className="card-body p-4 bg-white">
          <div className="d-flex flex-column gap-3">
            {pollOptions.map((option, index) => {
              const pct = calculatePercentage(votes[option.text] || 0);
              const isSelected = selectedOption === option.text;
              
              // Logic for text contrast on progress bar
              const isHighContrast = isResultView && pct > 50; 

              return (
                <div
                  key={option.id}
                  onClick={() => handleOptionSelect(option.text)}
                  className={`option-row position-relative rounded-3 overflow-hidden ${
                    !isResultView ? "cursor-pointer hover-effect" : ""
                  } ${isSelected && !isResultView ? "selected-border" : "default-border"}`}
                >
                  {/* BACKGROUND LAYER: Progress Bar (Only visible in results) */}
                  {isResultView && (
                    <div
                      className="progress-bg"
                      style={{ width: `${pct}%` }}
                    ></div>
                  )}

                  {/* CONTENT LAYER: Text and Circle */}
                  <div className="option-content position-relative d-flex justify-content-between align-items-center p-3">
                    <div className="d-flex align-items-center gap-3">
                      {/* Circle Indicator (1, 2, 3...) */}
                      <span
                        className={`circle-indicator d-flex align-items-center justify-content-center fw-bold ${
                          isHighContrast 
                            ? "bg-white text-purple" 
                            : isResultView && pct > 0 
                                ? "bg-purple text-white" 
                                : isSelected 
                                    ? "bg-purple text-white" 
                                    : "bg-gray text-white"   
                        }`}
                      >
                        {index + 1}
                      </span>
                      
                      {/* Option Text */}
                      <span className={`fw-medium ${isHighContrast ? "text-white" : "text-dark"}`}>
                        {option.text}
                      </span>
                    </div>

                    {/* Percentage (Only in results) */}
                    {isResultView && (
                      <span className={`fw-bold ${isHighContrast ? "text-white" : "text-dark"}`}>
                        {pct}%
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Submit Button (Only when voting) */}
      {!isResultView && (
        <div className="d-flex justify-content-end mt-4">
          <button
            className="btn btn-purple rounded-pill px-5 py-2 fw-bold"
            onClick={handleSubmit}
            disabled={!selectedOption}
          >
            Submit
          </button>
        </div>
      )}

      {/* Footer Text (Only when results shown) */}
      {isResultView && (
        <div className="text-center mt-5">
          <h5 className="fw-bold">Wait for the teacher to ask a new question..</h5>
        </div>
      )}

      <ChatPopover />
    </div>
  );
};

export default StudentPollPage;