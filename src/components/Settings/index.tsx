import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';
import { ApplicationModal } from '@/state/application/actions';
import { useModalOpen, useToggleSettingsMenu } from '@/state/application/hooks';
import { useExpertModeManager, useUserSlippageTolerance, useUserTransactionTTL } from '@/state/user/hooks';
import { useRef, useState } from 'react';
import styled from 'styled-components';
import { AutoColumn } from '../Column';
import { RowBetween } from '../Row';
import TransactionSettings from '../TransactionSettings';

const StyledMenu = styled.div`
  margin-left: 0.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  border: none;
  text-align: left;
`;

export default function SettingsTab() {
  const node = useRef<HTMLDivElement>();
  const open = useModalOpen(ApplicationModal.SETTINGS);
  const toggle = useToggleSettingsMenu();
  const [userSlippageTolerance, setUserslippageTolerance] = useUserSlippageTolerance();
  const [ttl, setTtl] = useUserTransactionTTL();
  const [expertMode, toggleExpertMode] = useExpertModeManager();
  const [showConfirmation, setShowConfirmation] = useState(false);

  useOnClickOutside(node, open ? toggle : undefined);

  return (
    <StyledMenu ref={node as any}>
      <Modal title="Are you sure?" isOpen={showConfirmation} onClose={() => setShowConfirmation(false)}>
        <div className="flex flex-col gap-4">
          <p>
            Expert mode turns off the confirm transaction prompt and allows high slippage trades that often result in
            bad rates and lost funds.
          </p>
          <p className="text-destructive text-balance">ONLY USE THIS MODE IF YOU KNOW WHAT YOU ARE DOING.</p>
          <Button
            variant="destructive"
            onClick={() => {
              if (window.prompt(`Please type the word "confirm" to enable expert mode.`) === 'confirm') {
                toggleExpertMode();
                setShowConfirmation(false);
              }
            }}
          >
            Turn On Expert Mode
          </Button>
        </div>
      </Modal>
      <h4>Market Order</h4>
      <Button variant="outline" size="icon" onClick={toggle} id="open-settings-dialog-button">
        <Icons.gear className="size-4" />
        {expertMode ? (
          <span
            role="img"
            className="absolute -top-2 -right-2 px-0.5 py-0.5 rounded-lg bg-destructive"
            aria-label="wizard-icon"
          >
            🧙
          </span>
        ) : null}
      </Button>
      {open && (
        <div className="min-w-[20.125rem] absolute top-12 right-0 z-50 bg-background/80 backdrop-blur-md rounded-lg p-4">
          <AutoColumn gap="md" style={{ padding: '1rem' }}>
            <h4>Transaction Settings</h4>
            <TransactionSettings
              rawSlippage={userSlippageTolerance}
              setRawSlippage={setUserslippageTolerance}
              deadline={ttl}
              setDeadline={setTtl}
            />
            <h4>Interface Settings</h4>
            <RowBetween>
              <div className="flex items-center gap-2">
                <h5>Toggle Expert Mode</h5>
                <Tooltip>
                  <TooltipTrigger>
                    <Icons.info className="size-4" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Bypasses confirmation modals and allows high slippage trades. Use at your own risk.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Switch
                checked={expertMode}
                onCheckedChange={() => {
                  if (expertMode) {
                    toggleExpertMode();
                    setShowConfirmation(false);
                  } else {
                    toggle();
                    setShowConfirmation(true);
                  }
                }}
              />
            </RowBetween>
          </AutoColumn>
        </div>
      )}
    </StyledMenu>
  );
}
