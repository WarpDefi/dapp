export const LoaderBarChart = () => {
  return (
    <div className="flex justify-between items-end w-full h-full gap-3">
      <div className="w-full rounded-md bg-primary animate-bar-height" style={{ animationDelay: '0s' }}></div>
      <div className="w-full rounded-md bg-primary animate-bar-height" style={{ animationDelay: '0.2s' }}></div>
      <div className="w-full rounded-md bg-primary animate-bar-height" style={{ animationDelay: '0.4s' }}></div>
      <div className="w-full rounded-md bg-primary animate-bar-height" style={{ animationDelay: '0.6s' }}></div>
      <div className="w-full rounded-md bg-primary animate-bar-height" style={{ animationDelay: '0.8s' }}></div>
      <div className="w-full rounded-md bg-primary animate-bar-height" style={{ animationDelay: '1s' }}></div>
      <div className="w-full rounded-md bg-primary animate-bar-height" style={{ animationDelay: '1.2s' }}></div>
      <div className="w-full rounded-md bg-primary animate-bar-height" style={{ animationDelay: '1.4s' }}></div>
      <div className="w-full rounded-md bg-primary animate-bar-height" style={{ animationDelay: '1.6s' }}></div>
      <div className="w-full rounded-md bg-primary animate-bar-height" style={{ animationDelay: '1.8s' }}></div>
    </div>
  );
};
