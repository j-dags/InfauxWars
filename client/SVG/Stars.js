import React from 'react'
import '../components/Landing.css'

function Stars() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="animated"
      version="1.1"
      viewBox="0 0 500 500"
      preserveAspectRatio="xMidYMid meet"
    >
      <g
        style={{
          WebkitTransformOrigin: 464.078,
          MsTransformOrigin: 464.078,
          transformOrigin: 464.078
        }}
        className="animable"
      >
        <g
          style={{
            WebkitTransformOrigin: 464.078,
            MsTransformOrigin: 464.078,
            transformOrigin: 464.078
          }}
          className="stars"
        >
          <path
            d="M471.65 68.87c0 2.39 3.71 2.39 3.68 0s-3.72-2.38-3.68 0z"
            style={{
              WebkitTransformOrigin: 473.488,
              MsTransformOrigin: 473.488,
              transformOrigin: 473.488
            }}
            fill="#E0E0E0"
            className="animable"
          />
          <path
            d="M453.1 87.89l3.61 1.25c1.31 5.07 1 5 4.08.78 5.3.3 5.07.66 2-3.64 1.91-4.94 2.19-4.61-2.85-3-4.11-3.35-3.71-3.51-3.76 1.76-.18.38-4.46 2.17-3.08 2.85z"
            style={{
              WebkitTransformOrigin: 458.896,
              MsTransformOrigin: 458.896,
              transformOrigin: 458.896
            }}
            fill="#E0E0E0"
            className="animable"
          />
        </g>
      </g>
      <g
        style={{
          WebkitTransformOrigin: 432.795,
          MsTransformOrigin: 432.795,
          transformOrigin: 432.795
        }}
        className="moon"
      >
        <path
          d="M457.94 52.74v.12a25.21 25.21 0 11-24.11-27.65 19.9 19.9 0 1024.12 27.53z"
          style={{
            WebkitTransformOrigin: 432.795,
            MsTransformOrigin: 432.795,
            transformOrigin: 432.795
          }}
          fill="#E0E0E0"
          className="animable"
        />
      </g>
      <defs>
        <filter id="active" height="200%">
          <feMorphology
            in="SourceAlpha"
            operator="dilate"
            radius="2"
            result="DILATED"
          />
          <feFlood floodColor="#32DFEC" floodOpacity="1" result="PINK" />
          <feComposite in="PINK" in2="DILATED" operator="in" result="OUTLINE" />
          <feMerge>
            <feMergeNode in="OUTLINE" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="hover" height="200%">
          <feMorphology
            in="SourceAlpha"
            operator="dilate"
            radius="2"
            result="DILATED"
          />
          <feFlood floodColor="red" floodOpacity="0.5" result="PINK" />
          <feComposite in="PINK" in2="DILATED" operator="in" result="OUTLINE" />
          <feMerge>
            <feMergeNode in="OUTLINE" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
          <feColorMatrix values="0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 1 0" />
        </filter>
      </defs>
    </svg>
  )
}

export default Stars
