import { CSSProperties, ReactNode } from "react";

export function Callout(props: CalloutProps) {
  const { className, children, style, content, isOpen, position, alignment } = {
    ...defaultProps,
    ...props,
  };

  const bottom = position === "top" ? "100%" : "auto";

  const wrapperClass = `callout_wrapper ${className}`;
  const wrapperStyle: CSSProperties = {
    ...style,
    direction: alignment === "right" ? "rtl" : "ltr",
    position: "relative",
  };

  const triggerStyle: CSSProperties = {
    direction: "ltr",
  };

  const contentStyle: CSSProperties = {
    display: isOpen ? "block" : "none",
    direction: "ltr",
    position: "absolute",
    bottom,
  };

  return (
    <div className={wrapperClass} style={wrapperStyle}>
      <div className="callout_trigger" style={triggerStyle}>
        {children}
      </div>
      <div className="callout_content" style={contentStyle}>
        {content}
      </div>
    </div>
  );
}

interface CalloutProps {
  isOpen?: boolean;
  className?: string;
  style?: CSSProperties;
  position?: "top" | "bottom";
  alignment?: "left" | "right";
  content: ReactNode;
  children: ReactNode;
}

const defaultProps: Partial<CalloutProps> = {
  isOpen: false,
  className: "",
  style: {},
  position: "top",
  alignment: "left",
};
