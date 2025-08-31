import styled from 'styled-components';
import { Icons } from '../icons';
import { RowFixed } from '../Row';
import { Button } from '../ui/button';

export default function SortButton({
  toggleSortOrder,
  ascending,
}: {
  toggleSortOrder: () => void;
  ascending: boolean;
}) {
  return (
    <Button variant="outline" size="icon" onClick={toggleSortOrder}>
      {ascending ? <Icons.chevronUp className="size-4" /> : <Icons.chevronDown className="size-4" />}
    </Button>
  );
}
