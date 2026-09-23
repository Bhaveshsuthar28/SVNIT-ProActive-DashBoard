import React from 'react';

interface SectionCardProps {
  title?: string;
  icon?: React.ReactNode;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

export const SectionCard: React.FC<SectionCardProps> = ({
  title,
  icon,
  headerRight,
  children,
  className = '',
  contentClassName = '',
}) => {
  return (
    <div
      className={`bg-white dark:bg-[#162032] rounded-xl border border-[#E6EAF0] dark:border-[#27354A] shadow-[0_1px_3px_0_rgba(16,33,63,0.04)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.3)] overflow-hidden flex flex-col transition-colors duration-200 ${className}`}
    >
      {(title || icon || headerRight) && (
        <div className="flex items-center justify-between px-4 pt-3.5 pb-2">
          <div className="flex items-center gap-2">
            {icon && (
              <div className="flex items-center justify-center text-[#1677FF] dark:text-[#38BDF8] [&>svg]:w-4 [&>svg]:h-4 [&>svg]:stroke-[2.5]">
                {icon}
              </div>
            )}
            {title && (
              <h3 className="text-[13px] font-bold text-[#10213F] dark:text-[#F1F5F9] tracking-tight">
                {title}
              </h3>
            )}
          </div>
          {headerRight && <div>{headerRight}</div>}
        </div>
      )}
      <div className={`flex-1 ${contentClassName}`}>{children}</div>
    </div>
  );
};

export default SectionCard;
