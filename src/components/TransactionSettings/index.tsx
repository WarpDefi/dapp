import { Icons } from '@/components/icons';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/utils';
import { useRef, useState } from 'react';
import styled from 'styled-components';
import { AutoColumn } from '../Column';
import { RowBetween } from '../Row';

enum SlippageError {
  InvalidInput = 'InvalidInput',
  RiskyLow = 'RiskyLow',
  RiskyHigh = 'RiskyHigh',
}

enum DeadlineError {
  InvalidInput = 'InvalidInput',
}

const FancyButton = styled.button`
  align-items: center;
  height: 2rem;
  border-radius: 36px;
  font-size: 1rem;
  width: auto;
  min-width: 3.5rem;
  outline: none;
`;

const Option = styled(FancyButton)<{ active: boolean }>`
  margin-right: 8px;
  :hover {
    cursor: pointer;
  }
`;

const OptionCustom = styled(FancyButton)<{ active?: boolean; warning?: boolean }>`
  height: 2rem;
  position: relative;
  padding: 0 0.75rem;
  flex: 1;

  input {
    width: 100%;
    height: 100%;
    border: 0px;
    border-radius: 2rem;
  }
`;

const SlippageEmojiContainer = styled.span`
  color: #f3841e;
`;

export interface SlippageTabsProps {
  rawSlippage: number;
  setRawSlippage: (rawSlippage: number) => void;
  deadline: number;
  setDeadline: (deadline: number) => void;
}

export default function SlippageTabs({ rawSlippage, setRawSlippage, deadline, setDeadline }: SlippageTabsProps) {
  const inputRef = useRef<HTMLInputElement>();
  const [slippageInput, setSlippageInput] = useState('');
  const [deadlineInput, setDeadlineInput] = useState('');

  const slippageInputIsValid =
    slippageInput === '' || (rawSlippage / 100).toFixed(2) === Number.parseFloat(slippageInput).toFixed(2);
  const deadlineInputIsValid = deadlineInput === '' || (deadline / 60).toString() === deadlineInput;

  let slippageError: SlippageError | undefined;
  if (slippageInput !== '' && !slippageInputIsValid) {
    slippageError = SlippageError.InvalidInput;
  } else if (slippageInputIsValid && rawSlippage < 50) {
    slippageError = SlippageError.RiskyLow;
  } else if (slippageInputIsValid && rawSlippage > 500) {
    slippageError = SlippageError.RiskyHigh;
  } else {
    slippageError = undefined;
  }

  let deadlineError: DeadlineError | undefined;
  if (deadlineInput !== '' && !deadlineInputIsValid) {
    deadlineError = DeadlineError.InvalidInput;
  } else {
    deadlineError = undefined;
  }

  function parseCustomSlippage(value: string) {
    setSlippageInput(value);

    try {
      const valueAsIntFromRoundedFloat = Number.parseInt((Number.parseFloat(value) * 100).toString());
      if (!Number.isNaN(valueAsIntFromRoundedFloat) && valueAsIntFromRoundedFloat < 5000) {
        setRawSlippage(valueAsIntFromRoundedFloat);
      }
    } catch {}
  }

  function parseCustomDeadline(value: string) {
    setDeadlineInput(value);

    try {
      const valueAsInt: number = Number.parseInt(value) * 60;
      if (!Number.isNaN(valueAsInt) && valueAsInt > 0) {
        setDeadline(valueAsInt);
      }
    } catch {}
  }

  return (
    <div className="flex flex-col gap-3">
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h5>Slippage tolerance</h5>
            <Tooltip>
              <TooltipTrigger>
                <Icons.info className="size-4" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Your transaction will revert if the price changes unfavorably by more than this percentage.</p>
              </TooltipContent>
            </Tooltip>
          </div>
          {!!slippageInput &&
          (slippageError === SlippageError.RiskyLow || slippageError === SlippageError.RiskyHigh) ? (
            <SlippageEmojiContainer>
              <span role="img" aria-label="warning">
                ⚠️
              </span>
            </SlippageEmojiContainer>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <RadioGroup
            className="flex items-center gap-2"
            onValueChange={value => {
              setRawSlippage(Number(value));
              setSlippageInput('');
            }}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="10" id="value-10" />
              <Label className="cursor-pointer" htmlFor="value-10">
                0.1%
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="50" id="value-50" />
              <Label className="cursor-pointer" htmlFor="value-50">
                0.5%
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="100" id="value-100" />
              <Label className="cursor-pointer" htmlFor="value-100">
                1%
              </Label>
            </div>
          </RadioGroup>
          <div className="flex items-center gap-2">
            <Input
              ref={inputRef as any}
              placeholder={(rawSlippage / 100).toFixed(2)}
              value={slippageInput}
              onBlur={() => {
                parseCustomSlippage((rawSlippage / 100).toFixed(2));
              }}
              onChange={e => parseCustomSlippage(e.target.value)}
              color={!slippageInputIsValid ? 'red' : ''}
            />
            %
          </div>
        </div>
        {!!slippageError && (
          <span
            className={cn(
              slippageError === SlippageError.InvalidInput ? 'text-destructive' : 'text-warning',
              'text-xs',
            )}
          >
            {slippageError === SlippageError.InvalidInput
              ? 'Enter a valid slippage percentage'
              : slippageError === SlippageError.RiskyLow
                ? 'Your transaction may fail'
                : 'Your transaction may be frontrun'}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <h5>Transaction deadline</h5>
        <Tooltip>
          <TooltipTrigger>
            <Icons.info className="size-4" />
          </TooltipTrigger>
          <TooltipContent>
            <p>Your transaction will revert if it is pending for more than this long.</p>
          </TooltipContent>
        </Tooltip>
      </div>
      <div className="flex items-center gap-2">
        <Input
          className={cn(!!deadlineError ? 'border-destructive text-destructive' : '', 'max-w-20')}
          onBlur={() => {
            parseCustomDeadline((deadline / 60).toString());
          }}
          placeholder={(deadline / 60).toString()}
          value={deadlineInput}
          onChange={e => parseCustomDeadline(e.target.value)}
        />
        <small>minutes</small>
      </div>
    </div>
  );
}
