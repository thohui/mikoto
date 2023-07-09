import { faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Modal } from '@mantine/core';
import { Message } from 'mikotojs';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { SpecialComponents } from 'react-markdown/lib/ast-to-react';
import { NormalComponents } from 'react-markdown/lib/complex-types';
import rehypeKatex from 'rehype-katex';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import styled from 'styled-components';

import { remarkEmoji } from '../../functions/remarkEmoji';
import { useMikoto } from '../../hooks';
import { ContextMenu, useContextMenu } from '../ContextMenu';
import { MessageAvatar } from '../atoms/Avatar';

const dateFormat = new Intl.DateTimeFormat('en', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

function isToday(someDate: Date): boolean {
  const today = new Date();
  return (
    someDate.getDate() === today.getDate() &&
    someDate.getMonth() === today.getMonth() &&
    someDate.getFullYear() === today.getFullYear()
  );
}

function isUrl(s: string) {
  let url;

  try {
    url = new URL(s);
  } catch (_) {
    return false;
  }

  return url.protocol === 'http:' || url.protocol === 'https:';
}

function isUrlImage(url: string): boolean {
  return url.match(/\.(jpeg|jpg|gif|png)$/) !== null;
}

function padTime(n: number): string {
  return String(n).padStart(2, '0');
}

const StyledEmoji = styled.img`
  display: inline-block;
  height: 1.5em;
  vertical-align: middle;
`;

function Emoji({ src }: { src: string }) {
  return <StyledEmoji src={src} />;
}

const MessageContainer = styled.div<{ isSimple?: boolean }>`
  margin: 0;
  margin-top: ${(p) => (p.isSimple ? 0 : '8px')};
  display: grid;
  grid-template-columns: min-content auto;
  min-height: 20px;
  grid-gap: 16px;
  padding: 2px 20px 6px;
  &:hover {
    background-color: rgba(0, 0, 0, 0.06);
  }

  p {
    margin: 0;
  }

  .avatar {
    margin-top: 4px;
  }
`;

const MessageInner = styled.div`
  margin: 0;
  padding-top: 4px;
  font-size: 14px;

  pre {
    padding: 16px;
    margin: 0;
    background-color: #282c34;
    color: #abb2bf;
    border-radius: 4px;

    & > div {
      padding: 0 !important;
    }
  }

  a {
    color: #00aff4;

    &:not(:hover) {
      text-decoration: none;
    }
  }

  img {
    max-height: 300px;
    max-width: 400px;
  }

  ul,
  ol {
    padding-inline-start: 24px;
  }
`;

const Name = styled.div<{ color: string | null }>`
  font-size: 14px;
  font-weight: 600;
  margin: 0;
  color: ${(p) => p.color ?? 'currentColor'};
`;

const StyledTimestamp = styled.div`
  color: #9f9e9e;
  font-size: 12px;
  padding-left: 8px;
`;

function Timestamp({ time }: { time: Date }) {
  return (
    <StyledTimestamp>
      {isToday(time) ? 'Today at ' : dateFormat.format(time)}{' '}
      {padTime(time.getHours())}:{padTime(time.getMinutes())}
    </StyledTimestamp>
  );
}

const NameBox = styled.div`
  display: flex;
  margin-bottom: 4px;
  & > * {
    align-self: flex-end;
  }
`;

interface MessageImageProps {
  src?: string;
  alt?: string;
}

const ImageModal = styled(Modal)`
  .mantine-Paper-root {
    background-color: transparent;
  }
`;

const ImageModalTitleLink = styled.a`
  color: #8b8b8b;
  transition-duration: 0.2s;

  &:hover {
    color: white;
    text-decoration: underline;
  }

  text-decoration: none;
  outline: none;
`;

const StyledMessageImage = styled.img`
  max-width: 100%;
`;

function MessageImage({ src, alt }: MessageImageProps) {
  const [opened, setOpened] = useState(false);

  return (
    <>
      <ImageModal
        opened={opened}
        onClose={() => setOpened(false)}
        centered
        withCloseButton={false}
        title={
          <ImageModalTitleLink href={src} target="_blank">
            Source
            <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
          </ImageModalTitleLink>
        }
      >
        <StyledMessageImage src={src} alt={alt} />
      </ImageModal>
      <img
        src={src}
        alt={alt}
        style={{ cursor: 'pointer' }}
        onClick={() => {
          setOpened(true);
        }}
      />
    </>
  );
}

interface MessageProps {
  message: Message;
  isSimple?: boolean;
}

const markdownComponents: Partial<
  Omit<NormalComponents, keyof SpecialComponents> & SpecialComponents
> = {
  img({ src, alt, className }) {
    if (className === 'emoji') {
      return <Emoji src={src!} />;
    }
    return <MessageImage src={src} alt={alt} />;
  },
};

function Markdown({ content }: { content: string }) {
  const co =
    isUrl(content) && isUrlImage(content)
      ? `![Image Embed](${content})`
      : content;

  return (
    <ReactMarkdown
      components={markdownComponents}
      remarkPlugins={[remarkGfm, remarkBreaks, remarkMath, remarkEmoji]}
      rehypePlugins={[rehypeKatex]}
    >
      {co}
    </ReactMarkdown>
  );
}

const AvatarFiller = styled.div`
  margin: 0;
  width: 40px;
`;

export function MessageItem({ message, isSimple }: MessageProps) {
  const mikoto = useMikoto();

  const menu = useContextMenu(() => (
    <ContextMenu>
      <ContextMenu.Link
        onClick={async () => {
          await mikoto.client.messages.delete(message.channelId, message.id);
        }}
      >
        Delete Message
      </ContextMenu.Link>
    </ContextMenu>
  ));

  return (
    <MessageContainer isSimple={isSimple} onContextMenu={menu}>
      {isSimple ? (
        <AvatarFiller />
      ) : (
        <MessageAvatar
          src={message.author?.avatar ?? undefined}
          user={message.author ?? undefined}
        />
      )}
      <MessageInner>
        {!isSimple && (
          <NameBox>
            <Name color="#20BBD2">{message.author?.name ?? 'Ghost'}</Name>
            <Timestamp time={new Date(message.timestamp)} />
          </NameBox>
        )}
        <Markdown content={message.content} />
      </MessageInner>
    </MessageContainer>
  );
}
