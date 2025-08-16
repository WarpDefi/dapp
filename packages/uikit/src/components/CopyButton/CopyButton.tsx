import { ElementType, useCallback, useEffect, useState } from "react";
import { useTooltip } from "../../hooks";
import { IconButton } from "../Button";
import { CopyIcon, SvgProps } from "../Svg";
import { copyText } from "./copyText";

interface CopyButtonProps extends SvgProps {
  text: string;
  tooltipMessage: string;
  buttonColor?: string;
  icon?: ElementType;
}

export const CopyButton: React.FC<React.PropsWithChildren<CopyButtonProps>> = ({
  text,
  tooltipMessage,
  width,
  buttonColor = "primary",
  icon: Icon = CopyIcon,
  ...props
}) => {
  const [isTooltipDisplayed, setIsTooltipDisplayed] = useState(false);

  const { targetRef, tooltip } = useTooltip(tooltipMessage, {
    placement: "auto",
    manualVisible: true,
    trigger: "hover",
  });

  const displayTooltip = useCallback(() => {
    setIsTooltipDisplayed(true);
  }, []);

  const handleOnClick = useCallback((event:any) => {
    event.preventDefault()
    copyText(text, displayTooltip);
  }, [text, displayTooltip]);

  useEffect(() => {
    if (isTooltipDisplayed) {
      const tooltipTimeout = setTimeout(() => {
        setIsTooltipDisplayed(false);
      }, 1000);
      return () => clearTimeout(tooltipTimeout);
    }

    return undefined;
  }, [isTooltipDisplayed]);

  return (
    <>
      <div ref={targetRef}>
        <IconButton onClick={handleOnClick} scale="sm" variant="text" style={{ width: "auto", position: "relative" }}>
          <Icon color={buttonColor} width={width} {...props} />
        </IconButton>
      </div>
      {isTooltipDisplayed && tooltip}
    </>
  );
};
