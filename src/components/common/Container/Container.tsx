import React from "react";
import { cn } from "~/lib/utils";

interface ContainerProps {
  children: React.ReactNode;
  props?: React.ComponentProps<"div">;
  className?: string;
}

export const Container: React.FC<ContainerProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        "container mx-auto max-w-7xl px-[100px] pt-[100px] pb-[50px]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};
