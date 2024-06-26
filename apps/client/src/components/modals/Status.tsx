import {
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  ModalContent,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { useSetRecoilState } from 'recoil';

import { modalState } from '@/components/ContextMenu';
import { Form } from '@/ui';

export function SetStatusModal() {
  const setModalState = useSetRecoilState(modalState);
  const form = useForm();

  return (
    <ModalContent rounded="md" p={4} maxW="400px">
      <Heading fontSize="xl">Set Status</Heading>
      <Form
        onSubmit={form.handleSubmit((data) => {
          console.log(data);
          setModalState(null);
        })}
      >
        <FormControl>
          <FormLabel>Your status</FormLabel>
          <Input {...form.register('status')} />
        </FormControl>

        <Button variant="primary" type="submit">
          Set status
        </Button>
        <Button type="button">Clear Status</Button>
      </Form>
    </ModalContent>
  );
}
