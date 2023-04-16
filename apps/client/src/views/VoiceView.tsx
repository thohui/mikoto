import { LiveKitRoom } from '@livekit/react-components';
import { Channel, VoiceToken } from 'mikotojs';
import React, { useEffect, useState } from 'react';

import { TabName } from '../components/TabBar';
import { ViewContainer } from '../components/ViewContainer';
import { useMikoto } from '../hooks';

export function VoiceView({ channel }: { channel: Channel }) {
  const mikoto = useMikoto();

  const [voiceConfig, setVoiceConfig] = useState<VoiceToken | null>(null);
  useEffect(() => {
    mikoto.getVoice(channel.id).then((x) => {
      setVoiceConfig(x);
    });
  }, []);

  return (
    <ViewContainer>
      <TabName name={`Voice: ${channel.name}`} />
      {voiceConfig && (
        <LiveKitRoom
          url={voiceConfig.url}
          token={voiceConfig.token}
          onConnected={async (room) => {
            await room.localParticipant.setMicrophoneEnabled(true);
          }}
        />
      )}
    </ViewContainer>
  );
}
