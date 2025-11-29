export default function Button({
  children,
  onClick,
  variant = "primary",
  className = "",
  type = "button",
}) {
  const baseStyle =
    "px-6 py-2 rounded-full font-medium transition-all duration-200 transform hover:scale-105";
  const variants = {
    primary:
      "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/50",
    secondary:
      "bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-900/50",
    outline:
      "border border-slate-600 hover:border-blue-500 text-slate-300 hover:text-white",
    danger:
      "bg-red-500/10 text-red-500 border border-red-500/50 hover:bg-red-500 hover:text-white",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseStyle} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
