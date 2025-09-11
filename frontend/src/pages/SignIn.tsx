import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InputField from '../components/InputField';
import CustomButton from '../components/CustomButton';

const SignIn: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) return;

    setIsLoading(true);
    
    // Simulate sign in - replace with actual authentication
    setTimeout(() => {
      setIsLoading(false);
      navigate('/home');
    }, 1000);
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
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            type="email"
          />
          
          <InputField
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            type="password"
          />
        </div>

        {/* Sign In Button */}
        <CustomButton
          title={isLoading ? "Signing In..." : "Sign In"}
          onPress={handleSignIn}
          disabled={!email.trim() || !password.trim() || isLoading}
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
