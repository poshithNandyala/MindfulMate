import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InputField from '../components/InputField';
import CustomButton from '../components/CustomButton';

const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignUp = async () => {
    setError('');
    
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    
    // Simulate sign up - replace with actual authentication
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
          <div className="text-6xl mb-4">🤖</div>
          <h1 className="text-3xl font-bold mb-2">Create Account</h1>
          <p className="text-medium">Join us on your mental wellness journey</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Form */}
        <div className="space-y-4 mb-6">
          <div className="flex space-x-3">
            <InputField
              label="First Name"
              placeholder="First name"
              value={firstName}
              onChangeText={setFirstName}
              className="mb-0"
            />
            <InputField
              label="Last Name"
              placeholder="Last name"
              value={lastName}
              onChangeText={setLastName}
              className="mb-0"
            />
          </div>
          
          <InputField
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            type="email"
          />
          
          <InputField
            label="Password"
            placeholder="Create a password"
            value={password}
            onChangeText={setPassword}
            type="password"
          />
          
          <InputField
            label="Confirm Password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            type="password"
          />
        </div>

        {/* Sign Up Button */}
        <CustomButton
          title={isLoading ? "Creating Account..." : "Sign Up"}
          onPress={handleSignUp}
          disabled={isLoading}
          className="w-full mb-6"
        />

        {/* Terms */}
        <div className="text-center mb-6">
          <p className="text-sm text-medium">
            By signing up, you agree to our{' '}
            <button className="text-light hover:underline">Terms of Service</button>
            {' '}and{' '}
            <button className="text-light hover:underline">Privacy Policy</button>
          </p>
        </div>

        {/* Sign In Link */}
        <div className="text-center">
          <span className="text-medium">Already have an account? </span>
          <button
            onClick={() => navigate('/signin')}
            className="text-light hover:underline font-medium"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
