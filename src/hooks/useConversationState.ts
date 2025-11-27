import { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';

export const useConversationState = (userId, policyId, sessionId) => {
  const [state, setState] = useState({
    currentIntent: null,
    answers: {},
    currentQuestionIndex: 0,
    isComplete: false,
    questions: []
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const loadState = async () => {
    try {
      setLoading(true);
      const response = await apiService.get(`/api/conversation-state/${sessionId}`);
      if (response.data) {
        setState(response.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const saveState = async (newState) => {
    try {
      setLoading(true);
      await apiService.post('/api/conversation-state', {
        userId,
        policyId,
        sessionId,
        ...newState
      });
      setState(newState);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const addAnswer = async (questionIndex, answer) => {
    const newAnswers = { ...state.answers, [`question_${questionIndex}`]: answer };
    const newState = {
      ...state,
      answers: newAnswers,
      currentQuestionIndex: questionIndex + 1
    };
    await saveState(newState);
  };
  
  const resetState = async () => {
    const newState = {
      currentIntent: null,
      answers: {},
      currentQuestionIndex: 0,
      isComplete: false,
      questions: []
    };
    await saveState(newState);
  };
  
  useEffect(() => {
    if (sessionId) {
      loadState();
    }
  }, [sessionId]);
  
  return {
    state,
    loading,
    error,
    addAnswer,
    resetState,
    saveState
  };
};
