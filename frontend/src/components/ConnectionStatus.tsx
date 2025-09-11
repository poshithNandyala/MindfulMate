import React, { useState, useEffect } from 'react';
import { healthAPI } from '../utils/api';

interface LLMStatus {
  gemini: { available: boolean; api_key_configured: boolean; error: string | null };
  openai: { available: boolean; api_key_configured: boolean; error: string | null };
}

interface LLMConfig {
  primary_llm: string;
  fallback_llm: string;
  fallback_enabled: boolean;
}

const ConnectionStatus: React.FC = () => {
  const [status, setStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [message, setMessage] = useState('');
  const [llmStatus, setLlmStatus] = useState<LLMStatus | null>(null);
  const [llmConfig, setLlmConfig] = useState<LLMConfig | null>(null);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      setStatus('connecting');
      const response = await healthAPI.checkHealth();
      
      // Also check LLM status
      const llmResponse = await healthAPI.checkLLMStatus();
      if (llmResponse) {
        setLlmStatus(llmResponse.status);
        setLlmConfig(llmResponse.configuration);
      }
      
      setStatus('connected');
      setMessage(response.message || 'Backend connected successfully');
    } catch (error) {
      setStatus('error');
      setMessage('Backend connection failed. Please ensure the backend server is running on port 8000.');
      console.error('Connection error:', error);
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'connected': return 'text-success';
      case 'error': return 'text-error';
      default: return 'text-warning';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'connected': return '✅';
      case 'error': return '❌';
      default: return '⏳';
    }
  };

  const getLLMStatusDisplay = () => {
    if (!llmConfig || !llmStatus) return null;
    
    const primaryAvailable = llmConfig.primary_llm === 'gemini' 
      ? llmStatus.gemini?.available 
      : llmStatus.openai?.available;
      
    const fallbackAvailable = llmConfig.fallback_llm === 'openai' 
      ? llmStatus.openai?.available 
      : false;
    
    return (
      <div className="text-xs text-secondary-text mt-1">
        🤖 {llmConfig.primary_llm === 'gemini' ? 'Gemini' : 'OpenAI'}: {primaryAvailable ? '✅' : '❌'}
        {llmConfig.fallback_enabled && (
          <> | Fallback: {fallbackAvailable ? '✅' : '❌'}</>
        )}
      </div>
    );
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className={`
        glass rounded-custom p-3 shadow-medium max-w-sm
        ${status === 'error' ? 'border-error/30' : status === 'connected' ? 'border-success/30' : 'border-warning/30'}
      `}>
        <div className="flex items-center gap-2">
          <span className="text-lg">{getStatusIcon()}</span>
          <div className="flex-1 min-w-0">
            <div className={`font-semibold text-sm ${getStatusColor()}`}>
              {status === 'connecting' ? 'Connecting...' : status === 'connected' ? 'Connected' : 'Connection Error'}
            </div>
            <div className="text-xs text-secondary-text truncate">
              {message}
            </div>
            {status === 'connected' && getLLMStatusDisplay()}
          </div>
          {status === 'error' && (
            <button
              onClick={checkConnection}
              className="text-xs px-2 py-1 bg-error/20 text-error rounded hover:bg-error/30 transition-colors"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConnectionStatus;
