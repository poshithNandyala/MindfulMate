import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import InputField from '../components/InputField';
import CustomButton from '../components/CustomButton';

const SignIn: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = async () => {
    if (!username.trim() || !password.trim()) return;

    setIsLoading(true);
    setError('');
    
    try {
      const success = await login(username, password);
      
      if (success) {
        navigate('/home');
      } else {
        setError('Invalid username or password');
      }
    } catch (error: any) {
      setError(error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark text-light flex flex-col justify-center items-center p-6">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🧘‍♀️</div>
          <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
          <p className="text-medium">Sign in to continue your mental health journey</p>
        </div>

        {/* Form */}
        <div className="space-y-4 mb-6">
          <InputField
            label="Username"
            placeholder="Enter your username"
            value={username}
            onChangeText={setUsername}
          />
          
          <InputField
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            type="password"
          />
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Sign In Button */}
        <CustomButton
          title={isLoading ? "Signing In..." : "Sign In"}
          onPress={handleSignIn}
          disabled={!username.trim() || !password.trim() || isLoading}
          className="w-full mb-6"
        />

        {/* Forgot Password */}
        <div className="text-center mb-6">
          <button className="text-medium hover:text-light transition-colors">
            Forgot Password?
          </button>
        </div>

        {/* Sign Up Link */}
        <div className="text-center">
          <span className="text-medium">Don't have an account? </span>
          <button
            onClick={() => navigate('/signup')}
            className="text-light hover:underline font-medium"
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
