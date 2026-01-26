import type { InputHTMLAttributes, ReactNode } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export function Input({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  style,
  ...props
}: InputProps) {
  return (
    <div style={styles.wrapper}>
      {label && <label style={styles.label}>{label}</label>}
      <div style={styles.inputWrapper}>
        {leftIcon && <span style={styles.leftIcon}>{leftIcon}</span>}
        <input
          style={{
            ...styles.input,
            ...(leftIcon ? { paddingLeft: "2.5rem" } : {}),
            ...(rightIcon ? { paddingRight: "2.5rem" } : {}),
            ...(error ? styles.inputError : {}),
            ...style,
          }}
          {...props}
        />
        {rightIcon && <span style={styles.rightIcon}>{rightIcon}</span>}
      </div>
      {error && <span style={styles.error}>{error}</span>}
      {hint && !error && <span style={styles.hint}>{hint}</span>}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "0.375rem",
  },
  label: {
    fontSize: "0.875rem",
    fontWeight: 500,
    color: "#374151",
  },
  inputWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  input: {
    width: "100%",
    padding: "0.625rem 0.875rem",
    fontSize: "1rem",
    borderRadius: "0.5rem",
    border: "1px solid #d1d5db",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
  },
  inputError: {
    borderColor: "#dc2626",
  },
  leftIcon: {
    position: "absolute",
    left: "0.75rem",
    color: "#9ca3af",
    display: "flex",
    alignItems: "center",
  },
  rightIcon: {
    position: "absolute",
    right: "0.75rem",
    color: "#9ca3af",
    display: "flex",
    alignItems: "center",
  },
  error: {
    fontSize: "0.75rem",
    color: "#dc2626",
  },
  hint: {
    fontSize: "0.75rem",
    color: "#6b7280",
  },
};
