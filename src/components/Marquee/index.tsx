import React from 'react'

const TopMarquee = ({ text }) => {
  return (
    <div className="w-full overflow-hidden whitespace-nowrap text-black py-2">
      <div className="inline-block animate-marquee hover:[animation-play-state:paused] will-change-transform" style={{ animationDelay: '0s', transform: 'translateX(100%)', animationDuration: '10s' }}>
        {text}
      </div>
    </div>
  );
};

export default TopMarquee
