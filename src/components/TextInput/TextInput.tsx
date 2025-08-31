import { cn } from '@/utils';
import { FC } from 'react';
import { TextInputProps } from './types';

const TextInput: FC<TextInputProps> = props => {
  const {
    label,
    labelColor,
    addonLabel,
    addonAfter,
    addonBefore,
    error,
    showErrorMessage = true,
    onChange,
    isNumeric,
    getRef = () => {},
    autoComplete = 'off',
    className,
    disabled,
    ...rest
  } = props;

  const inputRegex = new RegExp(`^\\d+\\.?\\d*$`);

  return (
    <div className={cn('w-full', label && 'flex flex-col gap-2')}>
      <div className={cn('flex items-center', label ? 'justify-between' : 'justify-end')}>
        {label && <small>{label}</small>}
        {addonLabel && addonLabel}
      </div>
      <div
        className={cn(
          'rounded-lg w-full h-10 flex justify-between px-4 py-2 border [&>input]:bg-inherit bg-background',
          className,
        )}
      >
        {addonBefore && <div className="relative flex items-center justify-center">{addonBefore}</div>}
        <input
          className={cn('outline-none w-full', disabled ? 'cursor-not-allowed' : 'cursor-default', className, 'h-full')}
          {...(rest as any)}
          autoComplete={autoComplete}
          ref={ref => getRef(ref)}
          type={isNumeric ? 'number' : 'text'}
          onChange={e => {
            const value = (e.target as HTMLInputElement).value;

            if (isNumeric && !!value) {
              if (inputRegex.test(value)) {
                onChange && onChange(value);
              }
            } else {
              onChange && onChange(value);
            }
          }}
        />
        {addonAfter && <div className="relative flex items-center justify-center">{addonAfter}</div>}
      </div>
      {showErrorMessage && !!error && <small className="text-destructive">{error}</small>}
    </div>
  );
};

export default TextInput;
