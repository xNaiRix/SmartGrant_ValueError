export default function Input({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  required = false,
  className = "",
  ...props
}) {
  return (
    <div className="flex flex-col gap-2 w-full">
      {label && (
        <label className="text-sm font-medium text-slate-400 ml-1">
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`
          w-full bg-slate-950 border border-slate-800 text-slate-100 
          rounded-xl px-4 py-3 outline-none 
          focus:border-blue-500 focus:ring-1 focus:ring-blue-500 
          transition-all placeholder:text-slate-600
          ${className}
        `}
        {...props}
      />
    </div>
  );
}
