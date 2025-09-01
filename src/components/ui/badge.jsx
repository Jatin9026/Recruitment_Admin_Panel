import * as React from "react";

const Badge = React.forwardRef(({ className, variant = "default", ...props }, ref) => {
  const baseClasses = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";
  
  const variants = {
    default: "bg-gray-100 text-gray-900 hover:bg-gray-200",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
    destructive: "bg-red-100 text-red-900 hover:bg-red-200",
    outline: "border border-gray-300",
  };

  const classes = [
    baseClasses,
    variants[variant] || variants.default,
    className
  ].filter(Boolean).join(' ');

  return (
    <div
      ref={ref}
      className={classes}
      {...props}
    />
  );
});

Badge.displayName = "Badge";

export { Badge };
