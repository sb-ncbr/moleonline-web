import React from "react";

class WaveLoader extends React.Component {
  render() {
    return (
      <>
        <style>{`
          .loader-container {
            font-family: sans-serif;
            font-size: 32px;
            display: flex;
            align-items: center;
            gap: 5px;
          }

          .dots {
            display: flex;
            gap: 4px;
          }

          .dot {
            width: 10px;
            height: 10px;
            background-color: currentColor;
            border-radius: 50%;
            animation: wave 1s infinite ease-in-out;
          }

          .dot:nth-child(2) {
            animation-delay: 0.2s;
          }

          .dot:nth-child(3) {
            animation-delay: 0.4s;
          }

          @keyframes wave {
            0%, 80%, 100% {
              transform: translateY(0);
              opacity: 0.3;
            }
            40% {
              transform: translateY(-6px);
              opacity: 1;
            }
          }
        `}</style>

        <h1 className="loader-container">
          Loading
          <span className="dots">
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </span>
        </h1>
      </>
    );
  }
}

export default WaveLoader;
