import ReactSwitch from 'react-switch';
import { SwitchProps } from './types';

// here we need to do some hack, because react-switch package is still in commonjs
// https://github.com/vitejs/vite/issues/2139#issuecomment-824557740
const BaseSwitch = (ReactSwitch as any).default ? (ReactSwitch as any).default : ReactSwitch;

const Switch: React.FC<SwitchProps> = ({
  checked = false,
  onChange,
  checkedIcon = false,
  disabled = false,
  height,
  offColor,
  offHandleColor,
  onColor,
  onHandleColor,
  uncheckedIcon = false,
  width,
}) => {
  return (
    <BaseSwitch
      checked={checked}
      onChange={(isChecked: boolean) => onChange?.(isChecked)}
      onHandleColor={onHandleColor}
      offHandleColor={offHandleColor}
      onColor={onColor}
      offColor={offColor}
      uncheckedIcon={uncheckedIcon || false}
      checkedIcon={checkedIcon || false}
      disabled={disabled}
      height={height}
      width={width}
    />
  );
};

Switch.defaultProps = {
  onChange: () => {},
  checked: false,
  checkedIcon: false,
  disabled: false,
  uncheckedIcon: false,
};

export default Switch;
