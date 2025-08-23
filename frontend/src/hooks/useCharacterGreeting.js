import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

const useCharacterGreeting = (showCharacter) => {
  const { user } = useAuth();
  const hasShownGreetingRef = useRef(false);

  useEffect(() => {
    if (user && showCharacter && !hasShownGreetingRef.current) {
      hasShownGreetingRef.current = true;
      
      // Get user's name or default to "Chief"
      const userName = user?.name ? user.name.split(' ')[0] : 'Chief';
      
      // Define all messages
      const messages = [
        { pose: 'greeting1', text: `Hey ${userName}! I'm Cass`, position: 'bottom-right', size: 'large' },
        { pose: 'explain_left1', text: `I'll guide you through your pension planning journey!`, position: 'bottom-right' },
        { pose: 'point_left1', text: `Let's start by setting up your profile - click the button!`, position: 'bottom-right', highlight: 'get-started-button', size: 'large' }
      ];
      
      // Show character with first message and all messages data
      showCharacter({
        pose: messages[0].pose,
        message: messages[0].text,
        position: 'bottom-right',
        messages: messages,
        currentIndex: 0
      });
    }
  }, [user, showCharacter]);
};

export default useCharacterGreeting;
