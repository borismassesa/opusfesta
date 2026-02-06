import type { SVGAttributes } from "react";

const CardBannerEdge = (props: SVGAttributes<SVGElement>) => {
  return (
    <svg width="55" height="144" viewBox="0 0 55 144" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M22.4993 19.52C33.2382 26.5336 54.7912 28.9577 54.7912 28.9577V114.495C54.7912 114.495 33.2382 116.92 22.4993 123.933C10.4369 131.811 0 143.453 0 143.453V0C0 0 10.4369 11.642 22.4993 19.52Z"
        fill="var(--card)"
      />
    </svg>
  );
};

export default CardBannerEdge;
