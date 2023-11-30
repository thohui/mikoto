import { Button, Form, Image, Input, Modal } from '@mikoto-io/lucid';
import Tippy from '@tippyjs/react';
import { AxiosError } from 'axios';
import { ClientSpace, Invite, Space, SpaceStore } from 'mikotojs';
import { observer } from 'mobx-react-lite';
import { useRef, useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { useForm } from 'react-hook-form';
import { useRecoilState, useSetRecoilState } from 'recoil';
import styled from 'styled-components';

import { env } from '../env';
import { useMikoto } from '../hooks';
import { useErrorElement } from '../hooks/useErrorElement';
import { treebarSpaceState, workspaceState } from '../store';
import { useTabkit } from '../store/surface';
import { ContextMenu, modalState, useContextMenu } from './ContextMenu';
import { normalizeMediaUrl } from './atoms/Avatar';
import { Pill } from './atoms/Pill';
import { StyledSpaceIcon } from './atoms/SpaceIcon';

const StyledSpaceSidebar = styled.div`
  align-items: center;
  box-sizing: border-box;
  width: 68px;

  flex-grow: 1;
  overflow: scroll;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none; /* Safari and Chrome */
  }
`;

const InviteModalWrapper = styled.div`
  .invite-link {
    width: 100%;
    font-size: 14px;
    border-radius: 4px;
    display: block;
    padding: 16px;
    margin-bottom: 8px;
    border: none;
    color: var(--N0);
    background-color: var(--N1000);
    font-family: var(--font-mono);

    &:hover {
      background-color: var(--N1100);
    }
  }
`;

function InviteModal({ space }: { space: Space }) {
  const [invite, setInvite] = useState<Invite | null>(null);
  const mikoto = useMikoto();
  const link = invite
    ? `${env.PUBLIC_FRONTEND_URL}/invite/${invite.code}`
    : undefined;

  return (
    <Modal style={{ minWidth: '400px' }}>
      <InviteModalWrapper>
        {!invite ? (
          <Button
            type="button"
            onClick={() => {
              mikoto.client.spaces
                .createInvite({
                  spaceId: space.id,
                })
                .then((x) => {
                  setInvite(x);
                });
            }}
          >
            Generate
          </Button>
        ) : (
          <>
            <h1>Invite Link</h1>
            <button
              className="invite-link"
              type="button"
              onClick={() => {
                // copy to clipboard
                navigator.clipboard.writeText(link ?? '');
              }}
            >
              {link}
            </button>
            <Button
              type="button"
              variant="primary"
              onClick={() => {
                navigator.share({
                  title: `Invite to ${space.name} on Mikoto`,
                  url: link,
                });
              }}
            >
              Share
            </Button>
          </>
        )}
      </InviteModalWrapper>
    </Modal>
  );
}

function ServerIconContextMenu({ space }: { space: ClientSpace }) {
  const tabkit = useTabkit();
  const setModal = useSetRecoilState(modalState);

  return (
    <ContextMenu>
      <ContextMenu.Link
        onClick={async () =>
          tabkit.openTab(
            {
              kind: 'spaceSettings',
              key: space.id,
              spaceId: space.id,
            },
            true,
          )
        }
      >
        Space Settings
      </ContextMenu.Link>
      <ContextMenu.Link
        onClick={async () => await navigator.clipboard.writeText(space.id)}
      >
        Copy ID
      </ContextMenu.Link>
      <ContextMenu.Link
        onClick={() => {
          setModal({
            elem: <InviteModal space={space} />,
          });
        }}
      >
        Generate Invite
      </ContextMenu.Link>
      <ContextMenu.Link
        onClick={async () => {
          await space.leave();
        }}
      >
        Leave Space
      </ContextMenu.Link>
    </ContextMenu>
  );
}

const StyledIconWrapper = styled.div`
  display: flex;
  position: relative;
  flex-direction: column;
  align-items: center;
  margin-bottom: 8px;
  width: 68px;
`;

const Tooltip = styled.div`
  color: var(--N0);
  background-color: var(--N1200);
  border-radius: 4px;
  padding: 4px 8px;
  box-shadow: rgba(0, 0, 0, 0.1) 0 8px 24px;
`;

function SidebarSpaceIcon({ space }: { space: ClientSpace }) {
  // TF is this name?
  const [stateSpace, setSpace] = useRecoilState(treebarSpaceState);
  const isActive = stateSpace === space.id;
  const setWorkspace = useSetRecoilState(workspaceState);

  const [, drag] = useDrag(
    () => ({
      type: 'SPACE',
      item: { spaceId: space.id },
    }),
    [space.id],
  );
  const [, drop] = useDrop({
    accept: 'SPACE',
    drop: (item: { spaceId: string }) => {
      console.log(item);
    },
  });

  const ref = useRef<HTMLDivElement>(null);
  drag(drop(ref));
  const contextMenu = useContextMenu(() => (
    <ServerIconContextMenu space={space} />
  ));

  return (
    <Tippy
      animation={false}
      content={<Tooltip>{space.name}</Tooltip>}
      placement="right"
      offset={[0, 0]}
    >
      <StyledIconWrapper>
        <Pill h={isActive ? 32 : 8} />
        <StyledSpaceIcon
          active={isActive}
          onContextMenu={contextMenu}
          ref={ref}
          icon={space.icon ? normalizeMediaUrl(space.icon) : undefined}
          onDoubleClick={() => {
            setWorkspace((x) => ({ ...x, leftOpen: !x.leftOpen }));
          }}
          onClick={() => {
            setSpace(space.id);
            space.fetchMembers().then();
          }}
        >
          {space.icon === null ? space.name[0] : ''}
        </StyledSpaceIcon>
      </StyledIconWrapper>
    </Tippy>
  );
}

function SpaceCreateForm({ closeModal }: { closeModal: () => void }) {
  const mikoto = useMikoto();
  const form = useForm();

  return (
    <Form
      onSubmit={form.handleSubmit(async (data) => {
        await mikoto.client.spaces.create(data.spaceName);
        closeModal();
        form.reset();
      })}
    >
      <Input
        labelName="Space Name"
        placeholder="Awesomerino Space"
        {...form.register('spaceName')}
      />
      <Button variant="primary" type="submit">
        Create Space
      </Button>
    </Form>
  );
}

function SpaceJoinForm({ closeModal }: { closeModal: () => void }) {
  const mikoto = useMikoto();

  const { register, handleSubmit, reset } = useForm();
  const error = useErrorElement();
  return (
    <Form
      onSubmit={handleSubmit(async (data) => {
        try {
          await mikoto.client.spaces.join({
            inviteCode: data.inviteCode,
          });
          closeModal();
          reset();
        } catch (e) {
          error.setError((e as AxiosError).response?.data as any);
        }
      })}
    >
      {error.el}
      <Input labelName="Invite Link/Code" {...register('inviteCode')} />
      <Button>Join Space</Button>
    </Form>
  );
}

const SpaceJoinModalWrapper = styled.div`
  min-width: 400px;
  .inviteheader {
    text-align: center;
  }
`;

export function SpaceJoinModal() {
  const setModal = useSetRecoilState(modalState);

  return (
    <Modal>
      <SpaceJoinModalWrapper>
        <h1 className="inviteheader" style={{ marginTop: 0 }}>
          Create a Space
        </h1>
        <SpaceCreateForm
          closeModal={() => {
            setModal(null);
          }}
        />
        <h2 className="inviteheader">Have an invite already?</h2>
        <SpaceJoinForm
          closeModal={() => {
            setModal(null);
          }}
        />
      </SpaceJoinModalWrapper>
    </Modal>
  );
}

function ServerSidebarContextMenu() {
  const setModal = useSetRecoilState(modalState);

  return (
    <ContextMenu>
      <ContextMenu.Link
        onClick={() => {
          setModal({
            elem: <SpaceJoinModal />,
          });
        }}
      >
        Create / Join Space
      </ContextMenu.Link>
    </ContextMenu>
  );
}

const Seperator = styled.hr`
  border-width: 1px;
  width: 28px;
  border-color: var(--N500);
`;

export const SpaceSidebar = observer(({ spaces }: { spaces: SpaceStore }) => {
  const setModal = useSetRecoilState(modalState);
  const [spaceId, setSpaceId] = useRecoilState(treebarSpaceState);

  const contextMenu = useContextMenu(() => <ServerSidebarContextMenu />);

  return (
    <StyledSpaceSidebar onContextMenu={contextMenu}>
      <StyledIconWrapper>
        <Pill h={spaceId === null ? 32 : 8} />
        <StyledSpaceIcon
          style={{
            background:
              spaceId === null
                ? 'linear-gradient(133deg, #2298ff 0%, rgba(59,108,255,1) 100%)'
                : undefined,
            marginTop: '8px',
          }}
          active
          onClick={() => {
            setSpaceId(null);
          }}
        >
          <Image src="/logo/logo.svg" w={20} />
        </StyledSpaceIcon>
      </StyledIconWrapper>
      <Seperator />

      {Array.from(spaces.values())
        .filter((x) => x.type === 'NONE') // TODO: filter this on the server
        .map((space) => (
          <SidebarSpaceIcon space={space} key={space.id} />
        ))}
      <StyledIconWrapper>
        <StyledSpaceIcon
          onClick={() => {
            setModal({
              elem: <SpaceJoinModal />,
            });
          }}
        >
          +
        </StyledSpaceIcon>
      </StyledIconWrapper>
    </StyledSpaceSidebar>
  );
});