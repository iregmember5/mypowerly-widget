const Button = ({ type = 'button', variant = 'solid', loading, children, style, ...props }) => {
  return (
    <button
      type={type}
      disabled={loading}
      style={{
        padding: '12px 24px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: 600,
        border: 'none',
        cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.7 : 1,
        ...style
      }}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
};

export default Button;
