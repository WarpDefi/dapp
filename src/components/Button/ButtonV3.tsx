import React from 'react';
import { IconAfter, IconBefore, Root } from './styles';
import { ButtonProps } from './types';

const ButtonV3: React.FC<ButtonProps> = (props) => {
  const { iconBefore, children, iconAfter, loading, loadingText, as, target, ...rest } = props;
  return (
    <Root {...rest} as={as} target={target}>
      {loading ? (
        loadingText || 'Loading...'
      ) : (
        <>
          {iconBefore && <IconBefore>{iconBefore}</IconBefore>}
          {children}
          {iconAfter && <IconAfter>{iconAfter}</IconAfter>}
        </>
      )}
    </Root>
  );
};

ButtonV3.defaultProps = {
  target: '_blank',
};

export default ButtonV3;
