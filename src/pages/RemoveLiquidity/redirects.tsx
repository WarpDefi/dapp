import { Navigate, useParams } from 'react-router-dom';

const OLD_PATH_STRUCTURE = /^(0x[a-fA-F0-9]{40})-(0x[a-fA-F0-9]{40})$/;

export function RedirectOldRemoveLiquidityPathStructure() {
  const { tokens } = useParams<{ tokens: string }>();

  if (!tokens) {
    return <Navigate to="/pool" />;
  }

  if (!OLD_PATH_STRUCTURE.test(tokens)) {
    return <Navigate to="/pool" />;
  }

  const [currency0, currency1] = tokens.split('-');

  return <Navigate to={`/remove/${currency0}/${currency1}`} />;
}
