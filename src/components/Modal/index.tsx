import { Modal as PModal } from '@/components/ui/modal';
import { DialogContent, DialogOverlay } from '@reach/dialog';
import '@reach/dialog/styles.css';
import { useGesture } from '@use-gesture/react';
import React from 'react';
import { animated, useSpring, useTransition } from 'react-spring';
import styled, { css } from 'styled-components';

const AnimatedDialogOverlay = animated(DialogOverlay);
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const StyledDialogOverlay = styled(AnimatedDialogOverlay)`
  &[data-reach-dialog-overlay] {
    z-index: 2;
    background-color: transparent;
    overflow: hidden;

    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const AnimatedDialogContent = animated(DialogContent);
// destructure to not pass custom props to Dialog DOM element
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const StyledDialogContent = styled(({ minHeight, maxHeight, mobile, isOpen, ...rest }) => (
  <AnimatedDialogContent {...rest} />
)).attrs({
  'aria-label': 'dialog',
})`
  overflow-y: ${({ mobile }) => (mobile ? 'scroll' : 'hidden')};

  &[data-reach-dialog-content] {
    margin: 0 0 2rem 0;
    padding: 0 0 72px;
    width: 50vw;
    overflow-y: ${({ mobile }) => (mobile ? 'scroll' : 'hidden')};
    overflow-x: hidden;

    align-self: ${({ mobile }) => (mobile ? 'flex-end' : 'center')};

    max-width: 420px;
    ${({ maxHeight }) =>
      maxHeight &&
      css`
        max-height: ${maxHeight}vh;
      `}
    ${({ minHeight }) =>
      minHeight &&
      css`
        min-height: ${minHeight}vh;
      `}
    display: flex;
    border-radius: 20px;
  }
`;

interface ModalProps {
  isOpen: boolean;
  onDismiss: () => void;
  minHeight?: number | false;
  maxHeight?: number;
  initialFocusRef?: React.RefObject<any>;
  children?: React.ReactNode;
}

export default function Modal({
  isOpen,
  onDismiss,
  minHeight = false,
  maxHeight = 90,
  initialFocusRef,
  children,
}: ModalProps) {
  const fadeTransition = useTransition(isOpen, null, {
    config: { duration: 200 },
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
  });

  const [{ y }, set] = useSpring(() => ({ y: 0, config: { mass: 1, tension: 210, friction: 20 } }));
  const bind = useGesture({
    onDrag: state => {
      set({
        y: state.down ? state.movement[1] : 0,
      });
      if (state.movement[1] > 300 || (state.velocity > 3 && state.direction[1] > 0)) {
        onDismiss();
      }
    },
  });

  return (
    <>
      {fadeTransition.map(
        ({ item, key, props }) =>
          item && (
            <PModal title={null} isOpen={true} key={key} onClose={onDismiss}>
              {children}
            </PModal>
          ),
      )}
    </>
  );
}
