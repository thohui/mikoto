import { Box, Flex, Heading } from '@chakra-ui/react';

import { Surface } from '@/components/Surface';
import { TabName } from '@/components/tabs';

export function WelcomeSurface() {
  return (
    <Surface padded>
      <Box p={8}>
        <Flex direction="column" gap={4} align="center" justify="center">
          <TabName name="Welcome to Mikoto" />
          <Heading m={0} size="3xl">
            Welcome to Mikoto!
          </Heading>
          <Heading as="h2" m={0} size="md" opacity={0.5}>
            The most overkill messaging app in the world.
          </Heading>
        </Flex>
      </Box>
    </Surface>
  );
}
