import React from "react";

export interface AdSenseSlotProps {
  slotId?: string;
  format?: "auto" | "horizontal" | "rectangle" | "vertical";
  className?: string;
  style?: React.CSSProperties;
}

/**
 * AdSenseSlot: Disabled ad slot container.
 * Returns null to eliminate all advertisement spaces from the application.
 */
export const AdSenseSlot: React.FC<AdSenseSlotProps> = () => {
  return null;
};

export default AdSenseSlot;
