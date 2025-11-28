import React from "react";

export const Header: React.FC = () => {
  return (
    <svg
      width={40}
      height={40}
      viewBox="0 0 256 256"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      role="img"
    >
      <rect width="100%" height="100%" fill="transparent" />
      <g transform="translate(128 128)">
        <g stroke="#61DAFB" strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round">
          <ellipse rx="110" ry="45" />
          <ellipse rx="110" ry="45" transform="rotate(60)" />
          <ellipse rx="110" ry="45" transform="rotate(120)" />
        </g>
        <circle r={14} fill="#61DAFB" />
      </g>
    </svg>
  );
};

export default Header;
