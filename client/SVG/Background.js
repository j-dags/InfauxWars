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
          WebkitTransformOrigin: 249.17,
          MsTransformOrigin: 249.17,
          transformOrigin: 249.17
        }}
        className="background"
      >
        <path
          d="M46.89 95.76c9.87-19.88 43.17-52.68 77.18-63.53 12.72-4.06 15.34-14-14.75-12.59-47.84 2.25-69.19 34.1-73.51 59.75S37 115.64 46.89 95.76zM463 368.9c-15.41 30.31-43.11 63-87.12 85.47-35.26 18-1 21.92 25.36 17.68 37-5.95 63.24-30.84 73.54-63.05 9.69-30.21 3.64-70.39-11.78-40.1zm-2.24-213.65C426.17 89.65 369.66 55.84 319 36.16 239.4 5.2 157.62 19.27 102.92 56.87 13.45 118.36-16.37 273.32 51.8 376.63S199.89 491 294.67 470.79c161.9-34.44 228.49-197.34 166.12-315.54z"
          style={{
            WebkitTransformOrigin: 249.17,
            MsTransformOrigin: 249.17,
            transformOrigin: 249.17
          }}
          fill="#37474F"
          className="animable"
        />
      </g>
      <g
        style={{
          WebkitTransformOrigin: 200.691,
          MsTransformOrigin: 200.691,
          transformOrigin: 200.691
        }}
        className="light"
      >
        <g
          style={{
            WebkitTransformOrigin: 200.691,
            MsTransformOrigin: 200.691,
            transformOrigin: 200.691
          }}
          className="animable"
          opacity="0.6"
        >
          <path
            d="M30.11 334l278.5 71.39 78.33-108.19-75.79-264C234 6.16 155.82 20.51 102.92 56.87 25.09 110.36-7.59 234.59 30.11 334z"
            style={{
              WebkitTransformOrigin: 200.691,
              MsTransformOrigin: 200.691,
              transformOrigin: 200.691
            }}
            fill="#BA68C8"
            className="animable"
            opacity="0.3"
          />
          <path
            d="M30.11 334l278.5 71.39 78.33-108.19-75.79-264C234 6.16 155.82 20.51 102.92 56.87 25.09 110.36-7.59 234.59 30.11 334z"
            style={{
              WebkitTransformOrigin: 200.691,
              MsTransformOrigin: 200.691,
              transformOrigin: 200.691
            }}
            fill="#FFF"
            className="animable"
            opacity="0.1"
          />
        </g>
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
