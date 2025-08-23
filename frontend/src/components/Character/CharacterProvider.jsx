import React, { createContext, useContext, useState } from 'react';

const CharacterContext = createContext();

export const useCharacter = () => {
  const context = useContext(CharacterContext);
  if (!context) {
    throw new Error('useCharacter must be used within a CharacterProvider');
  }
  return context;
};

export const CharacterProvider = ({ children }) => {
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

  const value = {
    characterState,
    showCharacter,
    hideCharacter,
    nextMessage,
    previousMessage,
    callCharacterBack
  };

  return (
    <CharacterContext.Provider value={value}>
      {children}
    </CharacterContext.Provider>
  );
};

export default CharacterProvider;
