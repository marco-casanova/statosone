import type { ImgHTMLAttributes } from "react";

export interface AvatarProps extends ImgHTMLAttributes<HTMLImageElement> {
  size?: "sm" | "md" | "lg" | "xl";
  fallback?: string;
}

export function Avatar({
  size = "md",
  fallback,
  src,
  alt,
  style,
  ...props
}: AvatarProps) {
  const sizeMap = {
    sm: "2rem",
    md: "2.5rem",
    lg: "3rem",
    xl: "4rem",
  };

  const fontSizeMap = {
    sm: "0.75rem",
    md: "1rem",
    lg: "1.25rem",
    xl: "1.5rem",
  };

  const avatarStyle: React.CSSProperties = {
    width: sizeMap[size],
    height: sizeMap[size],
    borderRadius: "50%",
    objectFit: "cover",
    backgroundColor: "#e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: fontSizeMap[size],
    fontWeight: 500,
    color: "#6b7280",
    ...style,
  };

  if (!src && fallback) {
    return (
      <div style={avatarStyle} {...(props as React.HTMLAttributes<HTMLDivElement>)}>
        {fallback.charAt(0).toUpperCase()}
      </div>
    );
  }

  return <img src={src} alt={alt} style={avatarStyle} {...props} />;
}
