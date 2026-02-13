import { InfoIcon } from "lucide-react";
import { AnimatedTooltip, Animation, Placement } from "../animated-tooltip";

interface Props {
  placement?: Placement;
  animation?: Animation;
  content: string;
}

const InfoToolTip = ({ placement, animation, content }: Props) => {
  return (
    <AnimatedTooltip
      placement={placement}
      content={content}
      animation={animation}
    >
      <button className="rounded-lg  bg-card px-1 py-1 font-medium text-sm capitalize transition-colors hover:bg-accent">
        <InfoIcon className="h-3 w-3 text-foreground " />
      </button>
    </AnimatedTooltip>
  );
};

export default InfoToolTip;
