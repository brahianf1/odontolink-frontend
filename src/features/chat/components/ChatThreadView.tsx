import { forwardRef } from 'react';
import { Box, useTheme } from '@mui/material';
import type {
  ChatSessionResponseDTO,
  ChatViewerRole,
  OptimisticMessage,
} from '../types/chat.types';
import { getCounterpart, isBlockedByViewer } from '../utils/chatViewModel';
import ChatThreadHeader from './ChatThreadHeader';
import MessageList, { type MessageListHandle } from './MessageList';
import ChatComposer from './ChatComposer';
import BlockedBannerPractitioner from './BlockedBannerPractitioner';
import BlockedNoticePatient from './BlockedNoticePatient';

interface ChatThreadViewProps {
  session: ChatSessionResponseDTO;
  viewerRole: ChatViewerRole;
  viewerUserId: number | undefined;
  messages: OptimisticMessage[];
  initialLoading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  blockSubmitting: boolean;
  unblockSubmitting: boolean;
  showBackButton: boolean;
  onBack: () => void;
  onLoadMore: () => void;
  onSend: (content: string) => Promise<void> | void;
  onIncomingWhileFocused?: () => void;
  onRetrySend?: (tempId: number) => void;
  onRequestBlock: () => void;
  onUnblock: () => void;
}

const ChatThreadView = forwardRef<MessageListHandle, ChatThreadViewProps>(
  function ChatThreadView(
    {
      session,
      viewerRole,
      viewerUserId,
      messages,
      initialLoading,
      loadingMore,
      hasMore,
      error,
      blockSubmitting,
      unblockSubmitting,
      showBackButton,
      onBack,
      onLoadMore,
      onSend,
      onIncomingWhileFocused,
      onRetrySend,
      onRequestBlock,
      onUnblock,
    },
    ref
  ) {
    const theme = useTheme();
    const counterpart = getCounterpart(session, viewerRole);
    const blockedByMe = isBlockedByViewer(session, viewerUserId, viewerRole);
    const blockedByOther = session.blocked && !blockedByMe;

    const canBlock = viewerRole === 'PRACTITIONER';
    const composerDisabled = session.blocked && !blockedByMe;
    const composerDisabledReason = composerDisabled
      ? 'No puedes enviar mensajes mientras la conversación esté bloqueada.'
      : undefined;

    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          minHeight: 0,
          backgroundColor: theme.palette.background.default,
        }}
      >
        <ChatThreadHeader
          counterpart={counterpart}
          showBackButton={showBackButton}
          blocked={session.blocked}
          canBlock={canBlock}
          blockedByViewer={blockedByMe}
          onBack={onBack}
          onBlock={onRequestBlock}
          onUnblock={onUnblock}
        />

        {session.blocked && blockedByMe && (
          <BlockedBannerPractitioner
            reason={session.blockReason}
            blockedAt={session.blockedAt}
            submitting={unblockSubmitting}
            onUnblock={onUnblock}
          />
        )}

        {blockedByOther && (
          <BlockedNoticePatient
            blockerLabel={
              viewerRole === 'PRACTITIONER'
                ? 'El paciente'
                : 'El practicante'
            }
          />
        )}

        <MessageList
          ref={ref}
          messages={messages}
          viewerUserId={viewerUserId}
          hasMore={hasMore}
          loadingMore={loadingMore}
          initialLoading={initialLoading}
          error={error}
          onLoadMore={onLoadMore}
          onIncomingWhileFocused={onIncomingWhileFocused}
          onRetrySend={onRetrySend}
        />

        <ChatComposer
          sessionId={session.id}
          disabled={composerDisabled || blockSubmitting}
          disabledReason={composerDisabledReason}
          onSend={onSend}
        />
      </Box>
    );
  }
);

export default ChatThreadView;
