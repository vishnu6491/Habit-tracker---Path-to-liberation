import React, { useState } from 'react';
import { getSaintLevel } from '../utils/helpers';

const Environment = ({ progress, missedDays }) => {
  const levelInfo = getSaintLevel(progress);
  const [imageError, setImageError] = useState(false);
  const isDegraded = Object.keys(missedDays).some(key => missedDays[key] >= 2);

  const FallbackEnvironment = () => (
    <div className="environment-fallback">
      <div className="environment-icon">
        {isDegraded ? '🌑' : levelInfo.level >= 5 ? '🏛️' : levelInfo.level >= 3 ? '🏔️' : '🌲'}
      </div>
      <h3 className="gold-text environment-title">
        {isDegraded ? 'Environment Deteriorating' : levelInfo.env}
      </h3>
      {isDegraded && (
        <p className="environment-warning">Your discipline wanes. The path darkens.</p>
      )}
    </div>
  );

  return (
    <div className={`environment-card ${isDegraded ? 'environment-degraded' : ''}`}>
      {!isDegraded && !imageError ? (
        <div className="environment-image-container">
          <img 
            src={levelInfo.environment} 
            alt={levelInfo.env}
            className="environment-image"
            onError={() => setImageError(true)}
          />
          <div className="environment-overlay">
            <h3 className="gold-text environment-title">{levelInfo.env}</h3>
          </div>
        </div>
      ) : (
        <FallbackEnvironment />
      )}
    </div>
  );
};

export default Environment;
