import React from 'react';

export default function CyberBackground() {
  return (
    <div className="cyber-background">
       <div className="ambient-glow purple-glow"></div>
       <div className="ambient-glow blue-glow"></div>
       
       <div className="cyber-orb">
          <div className="orb-core"></div>
          <div className="orb-ring ring-1"></div>
          <div className="orb-ring ring-2"></div>
          
          <div className="orb-hex-pattern">
              <svg viewBox="0 0 100 100" className="football-svg">
                  {/* Outer glowing shell of the ball */}
                  <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.3" strokeDasharray="4 2" />
                  
                  {/* Geometric glowing hexagonal football structure */}
                  <g className="football-energy">
                    {/* Central Hexagon */}
                    <polygon points="50,30 67,40 67,60 50,70 33,60 33,40" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                    
                    {/* Connecting Arms */}
                    <line x1="50" y1="30" x2="50" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <line x1="67" y1="40" x2="84" y2="30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <line x1="67" y1="60" x2="84" y2="70" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <line x1="50" y1="70" x2="50" y2="90" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <line x1="33" y1="60" x2="16" y2="70" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <line x1="33" y1="40" x2="16" y2="30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />

                    {/* Edge Nodes */}
                    <circle cx="50" cy="10" r="2" fill="currentColor" />
                    <circle cx="84" cy="30" r="2" fill="currentColor" />
                    <circle cx="84" cy="70" r="2" fill="currentColor" />
                    <circle cx="50" cy="90" r="2" fill="currentColor" />
                    <circle cx="16" cy="70" r="2" fill="currentColor" />
                    <circle cx="16" cy="30" r="2" fill="currentColor" />
                    
                    {/* Energy Fills */}
                    <polygon points="50,45 58,52 50,60 42,52" fill="currentColor" opacity="0.8" className="pulse-slow" />
                  </g>
              </svg>
          </div>
       </div>

       <div className="floating-cubes">
          <div className="cube cube-1"></div>
          <div className="cube cube-2"></div>
          <div className="cube cube-3"></div>
          <div className="cube cube-4" style={{ top: '10%', left: '10%', transform: 'scale(0.5)' }}></div>
          <div className="cube cube-5" style={{ top: '80%', left: '30%', transform: 'scale(0.8)' }}></div>
       </div>
    </div>
  )
}
