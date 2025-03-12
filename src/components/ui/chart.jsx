"use client";

import * as React from "react";
import { AreaChart, BarChart, LineChart, PieChart } from "recharts";

const ChartContext = React.createContext({ parentWidth: 0, parentHeight: 0 });

const Chart = React.forwardRef(({ children, ...props }, ref) => {
  const [size, setSize] = React.useState({ width: 0, height: 0 });
  const containerRef = React.useRef(null);

  React.useEffect(() => {
    if (containerRef.current) {
      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          setSize({ width, height });
        }
      });

      observer.observe(containerRef.current);
      return () => observer.disconnect();
    }
  }, []);

  return (
    <div ref={containerRef} className="h-full w-full">
      <ChartContext.Provider
        value={{ parentWidth: size.width, parentHeight: size.height }}
      >
        <div ref={ref} {...props}>
          {children}
        </div>
      </ChartContext.Provider>
    </div>
  );
});
Chart.displayName = "Chart";

const ChartContainer = React.forwardRef(({ children, ...props }, ref) => {
  const { parentWidth, parentHeight } = React.useContext(ChartContext);

  return (
    <div ref={ref} {...props} className="h-full w-full">
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        return React.cloneElement(child, {
          width: parentWidth || 400,
          height: parentHeight || 300,
        });
      })}
    </div>
  );
});
ChartContainer.displayName = "ChartContainer";

const ChartTooltip = ({ content, ...props }) => {
  return content;
};

const ChartTooltipContent = React.forwardRef(
  ({ active, payload, label, className, ...props }, ref) => {
    if (!active || !payload?.length) return null;

    return (
      <div
        ref={ref}
        className="rounded-lg border bg-background p-2 shadow-sm"
        {...props}
      >
        <div className="grid grid-flow-col gap-2">
          <div className="text-sm font-medium text-foreground">{label}</div>
        </div>
        <div className="mt-1 grid gap-1">
          {payload.map((item, index) => (
            <div key={index} className="grid grid-flow-col items-center gap-2">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <div className="text-xs text-muted-foreground">{item.name}</div>
              <div className="text-xs font-medium text-foreground">
                {typeof item.value === "number"
                  ? item.value.toLocaleString()
                  : item.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
);
ChartTooltipContent.displayName = "ChartTooltipContent";

export {
  Chart,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  AreaChart,
  BarChart,
  LineChart,
  PieChart,
};
