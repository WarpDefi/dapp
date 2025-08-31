import React, { useCallback, useMemo, useState } from 'react';
import Scrollbars from 'react-custom-scrollbars';
import TokenListRow from './TokenListRow';
import { useFetchListCallback } from '@/hooks/useFetchListCallbackV3';
import { parseENSAddress } from '@/utils/parseENSAddress';
import { useTranslation } from 'react-i18next';
import uriToHttp from '@/utils/uriToHttp';
import Drawer from '@/components/Drawer';
import { TextInput } from '@/components/TextInput';
import { useListsStateAtom } from '@/state/listsV3';
import { Button } from '@/components/ui/button';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const TokenListDrawer: React.FC<Props> = ({ isOpen, onClose }) => {
  const [listUrlInput, setListUrlInput] = useState<string>('');

  const { listsState, removeList } = useListsStateAtom();

  const { t } = useTranslation();
  const lists = listsState?.byUrl;

  const adding = Boolean(lists[listUrlInput]?.loadingRequestId);
  const [addError, setAddError] = useState<string | null>(null);

  const fetchList = useFetchListCallback();

  const handleAddList = useCallback(() => {
    if (adding) return;
    setAddError(null);
    fetchList(listUrlInput)
      .then(() => {
        setListUrlInput('');
      })
      .catch(error => {
        setAddError(error.message);
        removeList(listUrlInput);
      });
  }, [adding, removeList, fetchList, listUrlInput]);

  const validUrl = useMemo(() => {
    return uriToHttp(listUrlInput).length > 0 || Boolean(parseENSAddress(listUrlInput));
  }, [listUrlInput]);

  const handleEnterKey = useCallback(
    (e: { key: string }) => {
      if (validUrl && e.key === 'Enter') {
        handleAddList();
      }
    },
    [handleAddList, validUrl],
  );

  const sortedLists = useMemo(() => {
    const listUrls = Object.keys(lists);
    return listUrls
      .filter(listUrl => {
        return Boolean(lists[listUrl].current);
      })
      .sort((u1, u2) => {
        const { current: l1 } = lists[u1];
        const { current: l2 } = lists[u2];
        if (l1 && l2) {
          return l1.name.toLowerCase() < l2.name.toLowerCase()
            ? -1
            : l1.name.toLowerCase() === l2.name.toLowerCase()
              ? 0
              : 1;
        }
        if (l1) return -1;
        if (l2) return 1;
        return 0;
      });
  }, [lists, listsState]);

  return (
    <Drawer title={t('searchModal.manageLists')} isOpen={isOpen} onClose={onClose}>
      {/* Render Search Token Input */}
      <div className="px-5">
        <div className="grid grid-cols-[auto_100px] gap-2.5">
          <TextInput
            placeholder="https:// or ipfs://"
            onChange={(value: any) => {
              setListUrlInput(value as string);
              setAddError(null);
            }}
            onKeyDown={handleEnterKey}
            value={listUrlInput}
          />
          <Button disabled={!validUrl} onClick={handleAddList}>
            {t('searchModal.add')}
          </Button>
        </div>

        {addError ? (
          <div className="text-destructive text-xs mt-2" title={addError}>
            {addError}
          </div>
        ) : null}
      </div>
      <Scrollbars>
        <div className="py-2.5 px-5">
          {sortedLists.map(url => (
            <TokenListRow listUrl={url} key={url} />
          ))}
        </div>
      </Scrollbars>
    </Drawer>
  );
};
export default TokenListDrawer;
