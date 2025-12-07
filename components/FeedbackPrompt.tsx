import React, { useState } from 'react';
import FeedbackModal from './FeedbackModal';

interface FeedbackPromptProps {
  onClose: () => void;
}

const FeedbackPrompt: React.FC<FeedbackPromptProps> = ({ onClose }) => {
  // Simply render the new internal feedback modal
  return <FeedbackModal onClose={onClose} />;
};

export default FeedbackPrompt;