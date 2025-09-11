import React from 'react';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  className?: string;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'mood';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  className = '',
  disabled = false,
  variant = 'primary',
  size = 'md',
  loading = false,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return 'bg-secondary-bg/50 text-primary-text border border-accent-bg hover:border-accent-color hover:bg-secondary-bg/70 shadow-soft hover:shadow-medium';
      case 'accent':
        return 'bg-gradient-to-r from-accent-color to-teal-400 text-white hover:from-accent-color/90 hover:to-teal-400/90 shadow-medium hover:shadow-large';
      case 'success':
        return 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-400 hover:to-green-500 shadow-medium hover:shadow-large';
      case 'warning':
        return 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-400 hover:to-orange-400 shadow-medium hover:shadow-large';
      case 'error':
        return 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-400 hover:to-red-500 shadow-medium hover:shadow-large';
      case 'mood':
        return 'bg-accent-bg/30 text-primary-text border border-accent-bg hover:border-accent-color/50 hover:bg-accent-color/10 backdrop-blur-sm';
      default:
        return 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-400 hover:to-purple-500 shadow-medium hover:shadow-large';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'px-4 py-2 text-sm';
      case 'lg':
        return 'px-8 py-4 text-lg';
      default:
        return 'px-6 py-3 text-base';
    }
  };

  return (
    <button
      onClick={onPress}
      disabled={disabled || loading}
      className={`
        ${getSizeStyles()}
        rounded-custom font-semibold transition-all duration-300 transform
        ${getVariantStyles()}
        ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105 active:scale-95'}
        ${className}
        btn-hover
      `}
    >
      <span className="flex items-center justify-center gap-2">
        {loading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {title}
      </span>
    </button>
  );
};

export default CustomButton;
