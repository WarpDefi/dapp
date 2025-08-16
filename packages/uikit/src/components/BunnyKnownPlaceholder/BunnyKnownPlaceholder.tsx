import { Image, ImageProps } from "../Image";

const BunnyKnownPlaceholder: React.FC<React.PropsWithChildren<ImageProps>> = (props) => {
  return (
    <Image width={props?.width || 100} height={props?.height || 100} src="/images/chart-placeholder.png"/>
  );
};
export default BunnyKnownPlaceholder;
