export interface LogoProps {
  value: number | undefined;
  decimals?: number;
  fontSize?: string;
  fontWeight?: number;
  wrap?: boolean;
  simple?: boolean;
}

export default function Percent({
  value,
  decimals = 2,
  fontSize = '16px',
  fontWeight = 500,
  wrap = false,
  simple = false,
  ...rest
}: LogoProps) {
  if (value === undefined || value === null) {
    return <p>-</p>;
  }

  const truncated = parseFloat(value.toFixed(decimals));

  if (simple) {
    return (
      <small className="" {...rest}>
        {Math.abs(value).toFixed(decimals)}%
      </small>
    );
  }

  return (
    <small className={truncated < 0 ? 'text-destructive' : 'text-success'} {...rest}>
      {wrap && '('}
      {truncated < 0 && '↓'}
      {truncated > 0 && '↑'}
      {Math.abs(value).toFixed(decimals)}%{wrap && ')'}
    </small>
  );
}
