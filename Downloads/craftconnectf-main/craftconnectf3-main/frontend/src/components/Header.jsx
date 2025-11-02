import React from "react";

const Header = ({ showNavigation, onReset, currentStep }) => {
  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="logo" onClick={onReset} style={{ cursor: "pointer" }}>
            <span className="logo-icon">🚀</span>
            <span className="logo-text">CraftConnect</span>
          </div>

          {currentStep && (
            <div className="progress-indicator">
              <span>Step {currentStep}/4</span>
            </div>
          )}

          {showNavigation && (
            <nav className="nav">
              <span className="nav-info">✅ Recording Complete</span>
              <button className="reset-btn" onClick={onReset}>
                Start Over
              </button>
            </nav>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
