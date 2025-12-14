
import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import backIcon from "../../assets/back.svg";
import "./PollHistoryPage.css"; // We will create this CSS file

let apiUrl = import.meta.env.VITE_API_BASE_URL;

const PollHistoryPage = () => {
  const [polls, setPolls] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const getPolls = async () => {
      const username = sessionStorage.getItem("username");
      try {
        const response = await axios.get(`${apiUrl}/polls/${username}`);
        setPolls(response.data.data);
      } catch (error) {
        console.error("Error fetching polls:", error);
      }
    };
    getPolls();
  }, []);

  const handleBack = () => {
    navigate("/teacher-home-page");
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "800px" }}>
      {/* --- HEADER SECTION --- */}
      <div className="d-flex align-items-center mb-5 gap-3">
        {/* Back Button (Clickable Area) */}
        <div 
            onClick={handleBack} 
            style={{ cursor: "pointer" }}
            className="d-flex align-items-center justify-content-center p-2 rounded-circle hover-bg-gray"
        >
            <img src={backIcon} alt="Back" width="24" />
        </div>
        <h2 className="m-0 fw-normal text-dark">
          View <b className="fw-bold">Poll History</b>
        </h2>
      </div>

      {/* --- POLLS LIST --- */}
      {polls.length > 0 ? (
        <div className="d-flex flex-column gap-5 pb-5">
          {polls.map((poll, index) => {
            const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);

            return (
              <div key={poll._id} className="poll-block">
                {/* Question Label */}
                <h4 className="fw-bold mb-3 text-dark">Question {index + 1}</h4>

                {/* Question Card */}
                <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                  
                  {/* Dark Header */}
                  <div className="question-header p-4 text-white">
                    <h5 className="m-0 fw-normal">{poll.question}</h5>
                  </div>

                  {/* Options Body */}
                  <div className="card-body p-4 bg-white">
                    <div className="d-flex flex-column gap-3">
                      {poll.options.map((option, optIndex) => {
                        const pct = totalVotes === 0 ? 0 : Math.round((option.votes / totalVotes) * 100);
                        const isHighContrast = pct > 50; // Text turns white if bar is > 50%

                        return (
                          <div 
                            key={option._id} 
                            className="option-row position-relative rounded-3 overflow-hidden border"
                          >
                            {/* 1. Background Progress Bar */}
                            <div 
                                className="progress-bg" 
                                style={{ width: `${pct}%` }}
                            ></div>

                            {/* 2. Content Overlay */}
                            <div className="option-content position-relative d-flex justify-content-between align-items-center p-3 px-4 h-100">
                                <div className="d-flex align-items-center gap-3">
                                    {/* Circle Indicator */}
                                    <span className={`circle-indicator d-flex align-items-center justify-content-center fw-bold ${
                                        isHighContrast 
                                            ? "bg-white text-purple" 
                                            : "bg-purple text-white"
                                    }`}>
                                        {optIndex + 1}
                                    </span>
                                    
                                    {/* Option Text */}
                                    <span className={`fw-medium ${isHighContrast ? "text-white" : "text-dark"}`}>
                                        {option.text}
                                    </span>
                                </div>

                                {/* Percentage */}
                                <span className={`fw-bold ${isHighContrast ? "text-white" : "text-dark"}`}>
                                    {pct}%
                                </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center text-muted mt-5">
          <h5>No poll history found.</h5>
        </div>
      )}
    </div>
  );
};

export default PollHistoryPage;