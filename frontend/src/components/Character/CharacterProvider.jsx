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
    currentIndex: 0,
    highlightIcon: false,
    calledViaChartIcon: false
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
    
    // Small delay to ensure character is visible before showing goodbye message
    setTimeout(() => {
      // Show appropriate bye message based on how Cass was called
      setCharacterState(prev => {
        const wasCalledViaChartIcon = prev.calledViaChartIcon;
        const goodbyeMessage = wasCalledViaChartIcon 
          ? 'Bye Chief! If you need me again for any chart explanation, just click on this button!' 
          : 'Bye Chief! See you later!';
        
        return {
          ...prev,
          message: goodbyeMessage,
          pose: 'greeting1',
          highlightIcon: wasCalledViaChartIcon,
          messages: [{ pose: 'greeting1', text: goodbyeMessage }], // Single goodbye message
          currentIndex: 0
        };
      });

      // Hide after showing bye message and remove icon highlight
      setTimeout(() => {
        setCharacterState({
          isVisible: false,
          pose: 'greeting1',
          message: '',
          position: 'bottom-right',
          messages: [],
          currentIndex: 0,
          highlightIcon: false,
          calledViaChartIcon: false
        });
      }, 3000);
    }, 100);
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
      currentIndex: 0,
      calledViaChartIcon: false,
      highlightIcon: false
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
          { pose: 'explain_right1', text: `There are three lines here – Blue is your Base Case, Green is the Best Case (when the market is in good condition), and Red is the Worst Case (when the market might not do so well).`, highlight: 'allLines' },
          { pose: 'point_left1', text: `The Blue line shows a realistic and balanced estimate of how your retirement savings could grow and decline over time.`, highlight: 'blueLine' },
          { pose: 'explain_left1', text: `The Green line is optimistic – it shows your money growing faster and lasting longer if things go really well.`, highlight: 'greenLine' },
          { pose: 'explain_right1', text: `The Red line is the cautious view – it shows what happens if returns are lower or expenses are higher, like when the market isn't performing well.`, highlight: 'redLine' },
          { pose: 'point_left1', text: `Notice that each curve has a peak – that's the point where your retirement corpus is at its highest, just before withdrawals start to reduce it.`, highlight: 'curvePeaks' },
          { pose: 'explain_left1', text: `There are two key phases: Growth phase (before retirement) and Withdrawal phase (after retirement).`, highlight: 'bothPhases' },
          { pose: 'explain_right1', text: `Notice how the Withdrawal phase shows the corpus declining as you use it for retirement expenses.`, highlight: 'withdrawalPhase' },
          { pose: 'explain_left1', text: `Now here's the key difference – in the Green line, even after your lifetime there's money left over.`, highlight: 'greenLineEnd' },
          { pose: 'explain_right1', text: `In the Red line, the money actually runs out before your lifetime ends, which is why it touches the baseline early.`, highlight: 'redLineEnd' },
          { pose: 'explain_left1', text: `And the Blue line sits right in the middle – the optimal balance where your corpus supports you throughout retirement.`, highlight: 'blueLineEnd' },
          { pose: 'greeting1', text: `Pro tip: The last 10 years before retirement contribute about 50% of your total corpus due to the power of compounding! 📈`, highlight: 'lastTenYears' },
          { pose: 'greeting1', text: `So in short – Blue is optimal, Green leaves extra, and Red means running out early. This helps you prepare for any future scenario! 🚀` }
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
      currentIndex: 0,
      calledViaChartIcon: true,
      highlightIcon: false
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
