export const LoaderAreaChart = () => {
  return (
    <svg className="w-full h-full" viewBox="0 0 200 100" preserveAspectRatio="none">
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#ffb357', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#ffb357', stopOpacity: 0 }} />
        </linearGradient>
      </defs>
      <path
        d="M 0 100 C 40 60, 40 60, 80 80 C 120 100, 120 20, 160 70 C 200 40, 200 50, 200 50 L 200 100 L 0 100 Z"
        className="fill-[url(#gradient)] animate-area-draw-line"
      />
    </svg>
  );
};
