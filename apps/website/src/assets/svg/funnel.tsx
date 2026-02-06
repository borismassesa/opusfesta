import type { SVGAttributes } from "react";

const Funnel = (props: SVGAttributes<SVGElement>) => {
  return (
    <svg width="390" height="389" viewBox="0 0 390 389" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g clipPath="url(#clip0_28527_188135)">
        <rect width="389.333" height="389" fill="var(--card)" fillOpacity="0.35" />
        <path
          d="M151.116 164.302L0.00195312 61.0625V388.44H389.332V61.0625L237.447 164.302C237.447 164.302 233.621 171.033 231.733 175.844C222.917 198.309 234.257 235.355 225.105 251.844C214.837 270.343 178.11 277.641 165.262 251.844C156.829 234.909 165.644 198.31 156.829 175.844C154.941 171.033 151.116 164.302 151.116 164.302Z"
          fill="color-mix(in oklab, var(--foreground) 6%, var(--card) 94%)"
          stroke="color-mix(in oklab, var(--foreground) 10%, var(--card) 90%)"
          strokeWidth="1"
          strokeOpacity="0.5"
        />
      </g>
    </svg>
  );
};

export default Funnel;
