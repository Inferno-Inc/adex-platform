import React from 'react';

// TODO; make it class with default props if needed
const AdexIcon = ({width, height}) => {

  const defautSize = {
    width: '185px',
    height: '72px'
  }

  return (
    <svg {...this.props}
      viewBox="0 0 185 72"
      width={(width || defautSize.width)} 
      height={(height || defautSize.height)} >
      <g >
        <path  fill="rgb(60, 60, 59)"
          d="M44.995,49.818 L36.605,58.060 L22.494,44.199 L8.383,58.060 L-0.007,49.818 L14.104,35.957 L-0.007,22.095 L8.383,13.853 L22.494,27.715 L36.605,13.853 L44.995,22.095 L30.884,35.957 L44.995,49.818 ZM22.494,13.562 L16.296,19.724 L9.354,12.904 L17.594,4.809 L22.494,-0.004 L27.394,4.809 L35.634,12.904 L28.692,19.724 L22.494,13.562 ZM22.494,58.438 L28.692,52.276 L35.634,59.095 L27.394,67.190 L22.494,72.003 L17.594,67.190 L9.354,59.095 L16.296,52.276 L22.494,58.438 Z"/>
        <path   fill="rgb(27, 117, 188)"
          d="M30.884,35.997 L44.995,22.124 L36.605,13.876 L22.494,27.748 L8.383,13.876 L-0.007,22.124 L14.104,35.997 L-0.007,49.869 L8.383,58.117 L22.494,44.245 L36.605,58.117 L44.995,49.869 L30.884,35.997 Z"/>
        <path  fill="rgb(60, 60, 59)"
          d="M185.004,59.417 L181.713,59.417 L171.925,45.572 L162.080,59.417 L158.961,59.417 L170.237,43.460 L159.391,28.389 L162.653,28.389 L171.925,41.463 L181.112,28.389 L184.231,28.389 L173.556,43.460 L185.004,59.417 ZM130.972,17.685 L153.839,17.685 L153.839,20.369 L133.893,20.369 L133.893,36.154 L152.722,36.154 L152.722,38.837 L133.893,38.837 L133.893,56.733 L153.839,56.733 L153.839,59.417 L130.972,59.417 L130.972,17.685 ZM117.235,54.680 L117.005,54.680 C114.640,58.219 111.243,59.989 106.817,59.989 C102.525,59.989 99.243,58.656 96.972,55.991 C94.700,53.326 93.566,49.444 93.566,44.345 C93.566,38.979 94.693,34.878 96.945,32.043 C99.196,29.208 102.468,27.790 106.760,27.790 C109.011,27.790 110.958,28.199 112.599,29.018 C114.240,29.836 115.708,31.235 117.005,33.214 L117.178,33.214 C117.062,30.816 117.005,28.466 117.005,26.164 L117.005,15.003 L119.810,15.003 L119.810,59.417 L117.949,59.417 L117.235,54.680 ZM117.005,43.859 C117.005,39.064 116.200,35.615 114.588,33.513 C112.975,31.411 110.365,30.360 106.760,30.360 C103.365,30.360 100.812,31.549 99.105,33.927 C97.397,36.306 96.545,39.760 96.545,44.288 C96.545,53.079 99.967,57.475 106.817,57.475 C110.328,57.475 112.903,56.459 114.544,54.420 C116.185,52.385 117.005,49.025 117.005,44.345 L117.005,43.859 ZM81.062,44.688 L64.061,44.688 L58.224,59.417 L54.990,59.417 L71.818,17.514 L73.679,17.514 L90.160,59.417 L86.872,59.417 L81.062,44.688 ZM74.393,27.020 C73.916,25.840 73.342,24.203 72.675,22.111 C72.161,23.937 71.598,25.592 70.988,27.077 L65.121,42.061 L80.089,42.061 L74.393,27.020 Z"/>
      </g>
    </svg>
  );
};

export default AdexIcon;
