import React, { useState } from 'react';

const InlineQuickReplies = ({ 
  replies = [], 
  onSelect, 
  max = 5, 
  disabled = false,
  className = '' 
}) => {
  const [showOverflow, setShowOverflow] = useState(false);
  
  if (!replies || replies.length === 0) return null;
  
  const visibleReplies = replies.slice(0, max);
  const overflowReplies = replies.slice(max);
  const hasOverflow = overflowReplies.length > 0;
  
  const handleReplyClick = (reply) => {
    if (disabled) return;
    onSelect(reply);
  };
  
  const handleOverflowToggle = () => {
    setShowOverflow(!showOverflow);
  };
  
  return (
    <div className={`mt-2 ${className}`} dir="rtl">
      {/* Visible quick replies */}
      <div 
        className="flex flex-wrap gap-2 mb-2" 
        role="group" 
        aria-label="תשובות מהירות"
      >
        {visibleReplies.map((reply, index) => (
          <button
            key={index}
            onClick={() => handleReplyClick(reply)}
            disabled={disabled}
            className={`
              px-3 py-1.5 text-sm font-medium rounded-full border transition-all duration-200
              ${disabled 
                ? 'border-gray-300 text-gray-400 cursor-not-allowed' 
                : 'border-green-300 text-green-700 hover:bg-green-50 hover:border-green-400 focus:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1'
              }
            `}
            aria-label={`בחר: ${reply}`}
            style={{ 
              minHeight: '28px',
              maxHeight: '32px'
            }}
          >
            {reply}
          </button>
        ))}
        
        {/* Overflow button */}
        {hasOverflow && (
          <button
            onClick={handleOverflowToggle}
            disabled={disabled}
            className={`
              px-3 py-1.5 text-sm font-medium rounded-full border transition-all duration-200
              ${disabled 
                ? 'border-gray-300 text-gray-400 cursor-not-allowed' 
                : 'border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1'
              }
            `}
            aria-label={`עוד ${overflowReplies.length} תשובות`}
            style={{ 
              minHeight: '28px',
              maxHeight: '32px'
            }}
          >
            עוד…
          </button>
        )}
      </div>
      
      {/* Overflow replies */}
      {showOverflow && hasOverflow && (
        <div className="flex flex-wrap gap-2 mb-2">
          {overflowReplies.map((reply, index) => (
            <button
              key={`overflow-${index}`}
              onClick={() => handleReplyClick(reply)}
              disabled={disabled}
              className={`
                px-3 py-1.5 text-sm font-medium rounded-full border transition-all duration-200
                ${disabled 
                  ? 'border-gray-300 text-gray-400 cursor-not-allowed' 
                  : 'border-green-300 text-green-700 hover:bg-green-50 hover:border-green-400 focus:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1'
                }
              `}
              aria-label={`בחר: ${reply}`}
              style={{ 
                minHeight: '28px',
                maxHeight: '32px'
              }}
            >
              {reply}
            </button>
          ))}
        </div>
      )}
      
      {/* Hint text */}
      <div className="text-xs text-gray-500 text-right">
        אפשר גם להקליד תשובה משלך
      </div>
    </div>
  );
};

export default InlineQuickReplies;
