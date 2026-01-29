const Input = ({ type = 'text', value, onChange, placeholder, disabled, style }) => {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      style={{
        width: '100%',
        padding: '10px 12px',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        fontSize: '14px',
        outline: 'none',
        boxSizing: 'border-box',
        ...style
      }}
      onFocus={(e) => !disabled && (e.currentTarget.style.borderColor = '#2b5a7d')}
      onBlur={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
    />
  );
};

export default Input;
