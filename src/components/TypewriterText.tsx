"use client";

import { useState, useEffect } from "react";

export default function TypewriterText({ 
  text, 
  className = "", 
  delay = 0 
}: { 
  text: string; 
  className?: string;
  delay?: number;
}) {
  const [displayedText, setDisplayedText] = useState("");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const startTimeout = setTimeout(() => {
      setStarted(true);
    }, delay);
    
    return () => clearTimeout(startTimeout);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    
    let index = 0;
    const interval = setInterval(() => {
      setDisplayedText(text.slice(0, index));
      index++;
      if (index > text.length) {
        clearInterval(interval);
      }
    }, 70);
    
    return () => clearInterval(interval);
  }, [text, started]);

  return (
    <span className={className}>
      {displayedText}
      <span className="animate-pulse border-r-4 border-primary ml-1 h-[1em] inline-block align-middle mb-1"></span>
    </span>
  );
}
