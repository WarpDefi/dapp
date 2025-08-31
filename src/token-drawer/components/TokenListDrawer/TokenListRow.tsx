import React, { useCallback, useRef, useState } from 'react';
import { ChevronDown } from 'react-feather';
import TokenListOrigin from '../TokenListOrigin';
import { useTranslation } from 'react-i18next';
import { Switch } from '@/components/Switch';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';
import listVersionLabel from '@/utils/listVersionLabel';
import { useListsStateAtom, useSelectedListUrl } from '@/state/listsV3';

interface Props {
  listUrl: string;
}

const TokenListRow: React.FC<Props> = ({ listUrl }) => {
  const { listsState, removeList, selectList } = useListsStateAtom();
  const lists = listsState?.byUrl;

  const { current: list } = lists[listUrl];
  const { t } = useTranslation();
  const selectedListUrl = useSelectedListUrl();
  const isSelected = (selectedListUrl || []).includes(listUrl);

  const [open, setOpen] = useState<boolean>(false);

  const node = useRef<HTMLDivElement>();

  const handleClose = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  useOnClickOutside(node, open ? handleClose : undefined);

  const selectThisList = useCallback(() => {
    selectList({ url: listUrl, shouldSelect: !isSelected });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectList, isSelected, listUrl]);

  const handleRemoveList = useCallback(() => {
    const answer = window.prompt(`${t('searchModal.confirmListRemovalPrompt')}`);
    if (answer?.toLocaleLowerCase() === 'remove') {
      removeList(listUrl);
    }
  }, [listUrl, removeList]);

  if (!list) return null;

  return (
    <div className="grid grid-cols-[max-content_auto_max-content_max-content] gap-2.5 py-3.5 items-center border-b border-border last:border-b-0">
      {list?.logoURI ? <img className="w-6 h-6" src={list?.logoURI} alt="List logo" /> : <div className="w-6 h-6" />}
      <div>
        <div className="text-base text-primary overflow-hidden text-ellipsis">{list?.name}</div>
        <div className="text-xs text-muted-foreground overflow-hidden text-ellipsis" title={listUrl}>
          <TokenListOrigin listUrl={listUrl} />
        </div>
      </div>
      <div ref={node as any} className="relative">
        <div
          className="w-5.5 h-5.5 rounded-full flex items-center justify-center cursor-pointer"
          onClick={() => setOpen(!open)}
        >
          <ChevronDown />
        </div>
        {open && (
          <div className="absolute z-[100] shadow-lg rounded-lg p-1.5 grid grid-rows-1 gap-2 text-base text-left bg-background border">
            <div>{list && listVersionLabel(list.version)}</div>
            <div className="w-full h-px bg-border"></div>
            <a
              className="text-xs text-primary cursor-pointer"
              href={`https://tokenlists.org/token-list?url=${listUrl}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('searchModal.viewList')}
            </a>
            <div
              className={`text-xs text-primary cursor-pointer ${Object.keys(lists).length === 1 ? 'pointer-events-none opacity-50' : ''}`}
              onClick={handleRemoveList}
            >
              {t('searchModal.removeList')}
            </div>
          </div>
        )}
      </div>
      <Switch checked={isSelected} onChange={() => selectThisList()} />
    </div>
  );
};

export default TokenListRow;
