type PageHeaderProps = {
  variant: 'pool' | 'farm' | 'stake' | 'okx' | 'vote';
  title: string;
  description: string;
  image?: string;
};

export const PageHeader = ({ variant, title, description, image }: PageHeaderProps) => {
  const variantClassSelector = () => {
    switch (variant) {
      case 'pool':
        return {
          background: 'radial-gradient(50% 90% at 0% 0%, #61c6d3 0%, #cbdfe5 100%)',
          descriptionColor: '#608f95',
        };
      case 'farm':
        return {
          background: 'radial-gradient(50% 90% at 0% 0%, #83cd5f 0%, #d5e5cb 100%)',
          descriptionColor: '#60957d',
        };
      case 'stake':
        return {
          background: 'radial-gradient(50% 90% at 0% 0%, #ffb148 0%, #f4e7ca 100%)',
          descriptionColor: '#99783e',
        };
      case 'okx':
        return {
          background: 'radial-gradient(50% 90% at 0% 0%, #000000 0%, #d9d5cd 100%)',
          descriptionColor: '#1a1a19',
        };
      case 'vote':
        return {
          background: 'radial-gradient(50% 90% at 0% 0%, #ccb5b7 0%, #fff3f7 100%)',
          descriptionColor: '#99783e',
        };
      default:
        return { background: '', descriptionColor: '' };
    }
  };

  return (
    <div className="relative">
      <div className="rounded-lg p-4 md:p-8" style={{ backgroundImage: variantClassSelector().background }}>
        <h3 className="text-2xl font-semibold text-foreground">{title}</h3>
        <p className="!m-0" style={{ color: variantClassSelector().descriptionColor }}>
          {description}
        </p>
        <img className="h-44 absolute bottom-3 right-6 hidden lg:block" src={image} alt="" />
      </div>
    </div>
  );
};
