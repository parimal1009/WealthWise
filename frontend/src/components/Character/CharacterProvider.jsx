import React, { createContext, useContext, useState } from 'react';
import { useChartHighlight } from '../../context/ChartHighlightContext';

const CharacterContext = createContext();

export const useCharacter = () => {
  const context = useContext(CharacterContext);
  if (!context) {
    throw new Error('useCharacter must be used within a CharacterProvider');
  }
  return context;
};

export const CharacterProvider = ({ children }) => {
  const { highlightElement, resetHighlights } = useChartHighlight();
  
  const [characterState, setCharacterState] = useState({
    isVisible: false,
    pose: 'greeting1',
    message: '',
    position: 'bottom-right',
    messages: [],
    currentIndex: 0
  });

  const showCharacter = ({ pose = 'greeting1', message, position = 'bottom-right', messages = [], currentIndex = 0 }) => {
    setCharacterState({
      isVisible: true,
      pose,
      message,
      position,
      messages,
      currentIndex
    });
  };

  const nextMessage = () => {
    setCharacterState(prev => {
      if (prev.currentIndex < prev.messages.length - 1) {
        const newIndex = prev.currentIndex + 1;
        const nextMsg = prev.messages[newIndex];
        
        // Handle highlighting for the new message
        if (nextMsg.highlight) {
          highlightElement('retirementChart', nextMsg.highlight, true);
        }
        
        return {
          ...prev,
          pose: nextMsg.pose,
          message: nextMsg.text,
          position: nextMsg.position || prev.position,
          size: nextMsg.size || prev.size,
          currentIndex: newIndex
        };
      }
      return prev;
    });
  };

  const previousMessage = () => {
    setCharacterState(prev => {
      const newIndex = prev.currentIndex - 1;
      if (newIndex >= 0) {
        const prevMsg = prev.messages[newIndex];
        
        // Handle highlighting for the previous message
        if (prevMsg.highlight) {
          highlightElement('retirementChart', prevMsg.highlight, true);
        }
        
        return {
          ...prev,
          pose: prevMsg.pose,
          message: prevMsg.text,
          position: prevMsg.position || prev.position,
          size: prevMsg.size || prev.size,
          currentIndex: newIndex
        };
      }
      return prev;
    });
  };

  const hideCharacter = () => {
    // Reset all highlights when hiding character
    resetHighlights('retirementChart');
    
    // Show bye message first
    setCharacterState(prev => ({
      ...prev,
      message: 'Bye! Call me anytime you need help!',
      pose: 'greeting1'
    }));

    // Hide after showing bye message
    setTimeout(() => {
      setCharacterState({
        isVisible: false,
        pose: 'greeting1',
        message: '',
        position: 'bottom-right',
        messages: [],
        currentIndex: 0
      });
    }, 2000);
  };

  const callCharacterBack = () => {
    const userName = 'Chief'; // Could be passed from context
    const messages = [
      { pose: 'greeting1', text: `Hey ${userName}! I'm back to help!` },
      { pose: 'explain_left1', text: `What can I do for you?` }
    ];

    setCharacterState({
      isVisible: true,
      pose: messages[0].pose,
      message: messages[0].text,
      position: 'bottom-right',
      messages: messages,
      currentIndex: 0
    });
  };

  const explainChart = (chartType) => {
    const userName = 'Chief'; // Could be passed from context
    let messages = [];

    // Reset highlights first
    resetHighlights('retirementChart');

    switch (chartType) {
      case 'retirementCorpus':
        messages = [
          { pose: 'greeting1', text: `Hey ${userName}! Let me explain this Retirement Corpus chart for you!` },
          { pose: 'explain_right1', text: `The blue line shows how your retirement corpus grows over time through contributions and compound interest.`, highlight: 'blueLine' },
          { pose: 'point_left1', text: `See that red dot? That marks your planned retirement year when you'll start withdrawing money.`, highlight: 'redDot' },
          { pose: 'explain_left1', text: `There are two key phases: Growth phase (green section before retirement) and Withdrawal phase (orange section after retirement).`, highlight: 'bothPhases' },
          { pose: 'explain_right1', text: `Notice how the withdrawal phase (orange area) shows the corpus declining as you use it for retirement expenses.`, highlight: 'withdrawalPhase' },
          { pose: 'greeting1', text: `Pro tip: The last 10 years contribute about 50% of your total corpus due to compound growth! 📈` }
        ];
        break;
      case 'payoutStrategy':
        messages = [
          { pose: 'greeting1', text: `${userName}, let me break down these payout strategies for you!` },
          { pose: 'explain_right1', text: `100% Annuity gives you maximum guaranteed income but no lump sum flexibility.` },
          { pose: 'point_left1', text: `60% Annuity + 40% Lump-sum offers the best balance of guaranteed income and tax efficiency.` },
          { pose: 'explain_left1', text: `80% Lump-sum + 20% Annuity gives maximum flexibility but higher tax burden.` },
          { pose: 'greeting1', text: `I recommend the 60-40 split for most people! 💰` }
        ];
        break;
      case 'taxSavings':
        messages = [
          { pose: 'greeting1', text: `${userName}, let's look at how tax planning can save you money!` },
          { pose: 'explain_right1', text: `Without planning, you pay full tax. But with EPF, you get basic tax savings.` },
          { pose: 'point_left1', text: `Adding NPS to EPF gives you even more savings through additional deductions.` },
          { pose: 'explain_left1', text: `An optimized strategy uses all available tax-saving instruments strategically.` },
          { pose: 'greeting1', text: `Proper planning can save you lakhs over your career! 🛡️` }
        ];
        break;
      default:
        messages = [
          { pose: 'greeting1', text: `${userName}, I'm here to help explain any chart you need!` },
          { pose: 'explain_left1', text: `Just click on the explanation icons next to the charts and I'll walk you through them.` }
        ];
    }

    // Apply initial highlight if present
    if (messages[0].highlight) {
      highlightElement('retirementChart', messages[0].highlight, true);
    }

    setCharacterState({
      isVisible: true,
      pose: messages[0].pose,
      message: messages[0].text,
      position: 'bottom-right',
      messages: messages,
      currentIndex: 0
    });
  };

  const value = {
    characterState,
    showCharacter,
    hideCharacter,
    nextMessage,
    previousMessage,
    callCharacterBack,
    explainChart
  };

  return (
    <CharacterContext.Provider value={value}>
      {children}
    </CharacterContext.Provider>
  );
};

export default CharacterProvider;
