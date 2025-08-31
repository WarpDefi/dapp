import { Icons } from '@/components/icons';
import { TextInput } from '@/components/TextInput';
import { Button } from '@/components/ui/button';
import { FC, useCallback, useEffect, useState } from 'react';
import { PriceInputProps } from './types';

const PriceInput: FC<PriceInputProps> = props => {
  const {
    value,
    decrement,
    increment,
    decrementDisabled = false,
    incrementDisabled = false,
    locked,
    onUserInput,
    title,
    tokenA,
    tokenB,
  } = props;

  // let user type value and only update parent value on blur
  const [localValue, setLocalValue] = useState('');
  const [useLocalValue, setUseLocalValue] = useState(false);

  const handleOnFocus = () => {
    setUseLocalValue(true);
  };

  const handleOnBlur = useCallback(() => {
    setUseLocalValue(false);

    onUserInput(localValue); // trigger update on parent value
  }, [localValue, onUserInput]);

  // for button clicks
  const handleDecrement = useCallback(() => {
    setUseLocalValue(false);
    onUserInput(decrement());
  }, [decrement, onUserInput]);

  const handleIncrement = useCallback(() => {
    setUseLocalValue(false);
    onUserInput(increment());
  }, [increment, onUserInput]);

  useEffect(() => {
    if (localValue !== value && !useLocalValue) {
      setTimeout(() => {
        setLocalValue(value); // reset local value to match parent
      }, 0);
    }
  }, [localValue, useLocalValue, value]);

  return (
    <div className="w-full flex flex-col gap-2 pt-2" onFocus={handleOnFocus} onBlur={handleOnBlur}>
      <div>
        <small>{title}</small>
      </div>
      <div className="flex items-center gap-2">
        {!locked && (
          <Button
            className="shrink-0"
            variant="secondary"
            size="icon"
            onClick={handleDecrement}
            disabled={decrementDisabled}
          >
            <Icons.minus className="size-4" />
          </Button>
        )}

        <TextInput
          className="text-center rounded-lg outline-none"
          value={localValue}
          fontSize={20}
          disabled={locked}
          onChange={val => {
            setLocalValue(val);
          }}
          isNumeric={localValue !== '∞'}
          placeholder="0.00"
        />

        {!locked && (
          <Button
            className="shrink-0"
            variant="secondary"
            size="icon"
            onClick={handleIncrement}
            disabled={incrementDisabled}
          >
            <Icons.plus className="size-4" />
          </Button>
        )}
      </div>
      <small>
        {tokenB} per {tokenA}
      </small>
    </div>
  );
};

export default PriceInput;
