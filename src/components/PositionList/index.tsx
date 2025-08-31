import { Icons } from '@/components/icons';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ConnectWalletButtonRainbow } from '@/components/ui/connect-wallet-button-rainbow';
import { Input } from '@/components/ui/input';
import { Loader } from '@/components/ui/loader';
import { useActiveWeb3React } from '@/hooks';
import { PositionListProps } from './types';

const PositionList = ({
  isLoading,
  menuItems,
  sortBy,
  onChangeSortBy,
  searchQuery,
  handleSearch,
  activeMenu,
  setMenu,
  doesNotPoolExist,
  children,
}: PositionListProps) => {
  const { account } = useActiveWeb3React();

  return (
    <div>
      {isLoading && <Loader />}
      <>
        <div className="flex gap-4 mb-4">
          <Input
            type="text"
            onChange={e => handleSearch(e.target.value)}
            defaultValue={searchQuery}
            id="token-search-input"
            placeholder="Search positions"
          />
          {/* <Select defaultValue={sortBy} onValueChange={val => onChangeSortBy(val)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select> */}
        </div>
        {doesNotPoolExist ? (
          account ? (
            <Alert>
              <Icons.inbox />
              <AlertTitle>No position</AlertTitle>
              <AlertDescription>You have no position in this wallet.</AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <Icons.inbox />
              <AlertTitle>Connect Wallet</AlertTitle>
              <AlertDescription>You have no position in this wallet.</AlertDescription>
              <div className="mt-4">
                <ConnectWalletButtonRainbow />
              </div>
            </Alert>
          )
        ) : (
          <div className="flex flex-col gap-4">{children}</div>
        )}
      </>
    </div>
  );
};

export default PositionList;
