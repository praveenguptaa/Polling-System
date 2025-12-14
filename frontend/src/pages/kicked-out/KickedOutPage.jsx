import React from 'react';
import stars from "../../assets/spark.svg"; // Adjust path

const KickedOutPage = () => {
    return (
        <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-white">
            <div className="d-inline-flex align-items-center bg-purple text-white px-3 py-1 rounded-pill mb-4" style={{backgroundColor: '#7565d9', fontSize: '0.9rem', fontWeight: '600'}}>
                <img src={stars} alt="" className="me-2" width="14"/> Intervue Poll
            </div>
            
            <h1 className="fw-normal mb-3 display-6">You’ve been <span className="fw-bold">Kicked out !</span></h1>
            
            <p className="text-muted text-center" style={{maxWidth: '450px', lineHeight: '1.6'}}>
                Looks like the teacher had removed you from the poll system. Please Try again sometime.
            </p>
        </div>
    );
};

export default KickedOutPage;