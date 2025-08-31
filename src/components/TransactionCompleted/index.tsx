import { Box } from '../Box';
import { BoxProps } from '../Box/Box';
import { Icons } from '../icons';
import { Text } from '../Text';
import { Button } from '../ui/button';
import { Root } from './styled';

export interface TransactionCompletedProps {
  onClose?: () => void;
  submitText?: string;
  showCloseIcon?: boolean;
  isShowButton?: boolean;
  onButtonClick?: () => void;
  buttonText?: string;
  rootStyle?: BoxProps;
}

const TransactionCompleted = ({
  onClose,
  submitText,
  showCloseIcon,
  isShowButton,
  onButtonClick,
  buttonText,
  rootStyle,
}: TransactionCompletedProps) => {
  return (
    <Root {...rootStyle}>
      <div className="flex flex-col items-center gap-4">
        <Icons.check className="size-32 text-success" />
        {submitText && <h4>{submitText}</h4>}
        {isShowButton && (
          <Button block onClick={onButtonClick}>
            {buttonText}
          </Button>
        )}
      </div>
    </Root>
  );
};
export default TransactionCompleted;
