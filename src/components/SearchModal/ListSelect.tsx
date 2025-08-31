import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { memo, useCallback, useMemo, useRef, useState } from 'react';
import { ArrowLeft } from 'react-feather';
import ReactGA from 'react-ga';
import { usePopper } from 'react-popper';
import { useDispatch, useSelector } from 'react-redux';
import { Text } from 'rebass';
import { useFetchListCallback } from '../../hooks/useFetchListCallback';
import { useOnClickOutside } from '../../hooks/useOnClickOutside';
import useToggle from '../../hooks/useToggle';
import { AppDispatch, AppState } from '../../state';
import { acceptListUpdate, removeList, selectList } from '../../state/lists/actions';
import { useSelectedListUrl } from '../../state/lists/hooks';
import listVersionLabel from '../../utils/listVersionLabel';
import { parseENSAddress } from '../../utils/parseENSAddress';
import uriToHttp from '../../utils/uriToHttp';
import Column from '../Column';
import ListLogo from '../ListLogo';
import QuestionHelper from '../QuestionHelper';
import Row, { RowBetween } from '../Row';

function ListOrigin({ listUrl }: { listUrl: string }) {
  const ensName = useMemo(() => parseENSAddress(listUrl)?.ensName, [listUrl]);
  const host = useMemo(() => {
    if (ensName) return undefined;
    const lowerListUrl = listUrl.toLowerCase();
    if (lowerListUrl.startsWith('ipfs://') || lowerListUrl.startsWith('ipns://')) {
      return listUrl;
    }
    try {
      const url = new URL(listUrl);
      return url.host;
    } catch (error) {
      return undefined;
    }
  }, [listUrl, ensName]);
  return <>{ensName ?? host}</>;
}

function listUrlRowHTMLId(listUrl: string) {
  return `list-row-${listUrl.replace(/\./g, '-')}`;
}

const ListRow = memo(function ListRow({ listUrl, onBack }: { listUrl: string; onBack: () => void }) {
  const listsByUrl = useSelector<AppState, AppState['lists']['byUrl']>(state => state.lists.byUrl);
  const selectedListUrl = useSelectedListUrl();
  const dispatch = useDispatch<AppDispatch>();
  const { current: list, pendingUpdate: pending } = listsByUrl[listUrl];

  const isSelected = listUrl === selectedListUrl;

  const [open, toggle] = useToggle(false);
  const node = useRef<HTMLDivElement>();
  const [referenceElement, setReferenceElement] = useState<HTMLButtonElement>();
  const [popperElement, setPopperElement] = useState<HTMLDivElement>();

  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: 'auto',
    strategy: 'fixed',
    modifiers: [{ name: 'offset', options: { offset: [8, 8] } }],
  });

  useOnClickOutside(node, open ? toggle : undefined);

  const selectThisList = useCallback(() => {
    if (isSelected) return;
    ReactGA.event({
      category: 'Lists',
      action: 'Select List',
      label: listUrl,
    });

    dispatch(selectList(listUrl));
    onBack();
  }, [dispatch, isSelected, listUrl, onBack]);

  const handleAcceptListUpdate = useCallback(() => {
    if (!pending) return;
    ReactGA.event({
      category: 'Lists',
      action: 'Update List from List Select',
      label: listUrl,
    });
    dispatch(acceptListUpdate(listUrl));
  }, [dispatch, listUrl, pending]);

  const handleRemoveList = useCallback(() => {
    ReactGA.event({
      category: 'Lists',
      action: 'Start Remove List',
      label: listUrl,
    });
    if (window.prompt(`Please confirm you would like to remove this list by typing REMOVE`) === `REMOVE`) {
      ReactGA.event({
        category: 'Lists',
        action: 'Confirm Remove List',
        label: listUrl,
      });
      dispatch(removeList(listUrl));
    }
  }, [dispatch, listUrl]);

  if (!list) return null;

  return (
    <Row key={listUrl} align="center" padding="16px" id={listUrlRowHTMLId(listUrl)}>
      {list.logoURI ? (
        <ListLogo style={{ marginRight: '1rem' }} logoURI={list.logoURI} alt={`${list.name} list logo`} />
      ) : (
        <div style={{ width: '24px', height: '24px', marginRight: '1rem' }} />
      )}
      <Column style={{ flex: '1' }}>
        <Row>
          <Text
            fontWeight={isSelected ? 500 : 400}
            fontSize={16}
            style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
          >
            {list.name}
          </Text>
        </Row>
        <Row
          style={{
            marginTop: '4px',
          }}
        >
          <div className="max-w-40 opacity-60 mr-2 text-sm overflow-hidden text-ellipsis" title={listUrl}>
            <ListOrigin listUrl={listUrl} />
          </div>
        </Row>
      </Column>
      <div className="flex justify-center items-center relative border-none">
        <Button
          variant="outline"
          size="sm"
          onClick={toggle}
          ref={setReferenceElement}
          className="w-8 p-2 rounded-xl text-sm mr-2"
        >
          <Icons.chevronDown />
        </Button>

        {open && (
          <div
            className="z-[100] visible opacity-100 transition-all duration-150 shadow-lg rounded-lg p-4 grid grid-rows-1 gap-2 text-base text-left bg-background border"
            ref={setPopperElement as any}
            style={styles.popper}
            {...attributes.popper}
          >
            <div>{list && listVersionLabel(list.version)}</div>
            <div className="w-full h-px bg-border"></div>
            <a href={`https://tokenlists.org/token-list?url=${listUrl}`}>View list</a>
            <Button variant="ghost" onClick={handleRemoveList} disabled={Object.keys(listsByUrl).length === 1}>
              Remove list
            </Button>
            {pending && (
              <Button variant="ghost" onClick={handleAcceptListUpdate}>
                Update list
              </Button>
            )}
          </div>
        )}
      </div>
      {isSelected ? (
        <Button disabled={true} className="w-20 min-w-20 py-2 px-1.5 rounded-xl text-sm">
          Selected
        </Button>
      ) : (
        <Button onClick={selectThisList} className="w-20 min-w-18 py-2 px-1.5 rounded-xl text-sm">
          Select
        </Button>
      )}
    </Row>
  );
});

export function ListSelect({ onDismiss, onBack }: { onDismiss: () => void; onBack: () => void }) {
  const [listUrlInput, setListUrlInput] = useState<string>('');

  const dispatch = useDispatch<AppDispatch>();
  const lists = useSelector<AppState, AppState['lists']['byUrl']>(state => state.lists.byUrl);
  const adding = Boolean(lists[listUrlInput]?.loadingRequestId);
  const [addError, setAddError] = useState<string | null>(null);

  const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setListUrlInput(e.target.value);
    setAddError(null);
  }, []);
  const fetchList = useFetchListCallback();

  const handleAddList = useCallback(() => {
    if (adding) return;
    setAddError(null);
    fetchList(listUrlInput)
      .then(() => {
        setListUrlInput('');
        ReactGA.event({
          category: 'Lists',
          action: 'Add List',
          label: listUrlInput,
        });
      })
      .catch(error => {
        ReactGA.event({
          category: 'Lists',
          action: 'Add List Failed',
          label: listUrlInput,
        });
        setAddError(error.message);
        dispatch(removeList(listUrlInput));
      });
  }, [adding, dispatch, fetchList, listUrlInput]);

  const validUrl: boolean = useMemo(() => {
    return uriToHttp(listUrlInput).length > 0 || Boolean(parseENSAddress(listUrlInput));
  }, [listUrlInput]);

  const handleEnterKey = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
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
  }, [lists]);

  return (
    <Column style={{ width: '100%', flex: '1 1' }}>
      <div className="p-5 pb-3">
        <RowBetween>
          <div>
            <ArrowLeft style={{ cursor: 'pointer' }} onClick={onBack} />
          </div>
          <Text fontWeight={500} fontSize={20}>
            Manage Lists
          </Text>
          <Icons.x onClick={onDismiss} />
        </RowBetween>
      </div>

      <div className="w-full h-px bg-border"></div>

      <div className="p-5 pb-3 flex flex-col gap-3.5">
        <Text fontWeight={600}>
          Add a list{' '}
          <QuestionHelper text="Token lists are an open specification for lists of ERC20 tokens. You can use any token list by entering its URL below. Beware that third party token lists can contain fake or malicious ERC20 tokens." />
        </Text>
        <Row>
          <input
            className="relative flex p-4 items-center w-full whitespace-nowrap bg-transparent border-none outline-none rounded-2xl text-lg transition-all duration-100 focus:outline-none bg-slate-500"
            type="text"
            id="list-add-input"
            placeholder="https:// or ipfs://"
            value={listUrlInput}
            onChange={handleInput}
            onKeyDown={handleEnterKey}
            style={{ height: '2.75rem', borderRadius: 12, padding: '12px' }}
          />
          <Button onClick={handleAddList} disabled={!validUrl}>
            Add
          </Button>
        </Row>
        {addError ? (
          <span className="text-destructive" title={addError} style={{ textOverflow: 'ellipsis', overflow: 'hidden' }}>
            {addError}
          </span>
        ) : null}
      </div>

      <div className="w-full h-px bg-border"></div>

      <div className="flex-1 overflow-auto">
        {sortedLists.map(listUrl => (
          <ListRow key={listUrl} listUrl={listUrl} onBack={onBack} />
        ))}
      </div>
      <div className="w-full h-px bg-border"></div>
    </Column>
  );
}
