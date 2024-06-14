import React, { useState, useEffect } from "react";
import "./style.scss"; // Import the CSS file
import { ClockLoader } from "react-spinners";
import { GoCheckCircleFill } from "react-icons/go";

const stepsData = [
  { title: 1, description: "Credit card payment verification initiated" },
  { title: 2, description: "Transaction creation for payment completion" },
  { title: 3, description: "Info verification for token transfer" },
  { title: 4, description: "Confirm token transfer to wallet address" },
  { title: 5, description: "Transaction creation for token transfer" },
];

const PaymentPopup = (props: any) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      if (currentStep < 5) {
        setCurrentStep((prevStep) => prevStep + 1);
      } else {
        setIsComplete(true);
        clearInterval(timer);
      }
    }, 10000); // 1 minute interval for each step

    return () => clearInterval(timer);
  }, [currentStep]);

  const handleClose = () => {
    if (isComplete) {
      console.log("current step", currentStep)
      console.log("completed");
      props.handleClose()
    }
  };

  return (
    <div className="payment-popup-container">

    <div className="payment-popup">
      <div className="popup-content">
        <h2>Purchase Token Steps</h2>
        {stepsData.map((step, index) => (
          <div
            key={index}
            className={`step-container ${
              index + 1 <= currentStep ? "completed" : ""
            }`}
          >
            {step.title === currentStep && step.title !== 5 ? (
              <div className="clock-loader"><ClockLoader size={30} color="#01f801"/></div>
            ) : step.title <= currentStep ? (
             <div className="check-fill"> <GoCheckCircleFill size={30} color="#01f801"/></div>
            ) : (
              <div className="step-number">{step.title}</div>
            )}
            <div className="step-description">{step.description}</div>
          </div>
        ))}
        <div className="description">
          {isComplete
            ? "Payment completed successfully!"
            : `Step ${currentStep}: Processing payment...`}
        </div>
        {isComplete && <button onClick={handleClose}>Close</button>}
      </div>
    </div>
    </div>
  );
};

export default PaymentPopup;
