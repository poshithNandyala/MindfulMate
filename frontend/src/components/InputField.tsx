import React from 'react';

interface InputFieldProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (value: string) => void;
  multiline?: boolean;
  rows?: number;
  className?: string;
  type?: string;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  multiline = false,
  rows = 1,
  className = '',
  type = 'text',
}) => {
  const inputClassName = `
    w-full px-4 py-3 rounded-lg
    bg-dark/50 border border-medium/30
    text-light placeholder-medium/60
    focus:border-light/50 focus:outline-none
    transition-colors duration-200
    ${className}
  `;

  return (
    <div className="mb-4">
      {label && (
        <label className="block text-light font-medium mb-2">
          {label}
        </label>
      )}
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChangeText(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className={inputClassName}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChangeText(e.target.value)}
          placeholder={placeholder}
          className={inputClassName}
        />
      )}
    </div>
  );
};

export default InputField;
