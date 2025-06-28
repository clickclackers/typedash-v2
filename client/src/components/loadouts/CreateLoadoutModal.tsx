import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react';
import { Field, Form, Formik } from 'formik';
import { FC } from 'react';
import * as Yup from 'yup';
import { createLoadout } from '../../services/services';

interface CreateLoadoutModalProps {
  isCreateOpen: boolean;
  onCreateClose: () => void;
  user: string;
  getLoadoutHandler: () => void;
}

const CreateLoadoutModal: FC<CreateLoadoutModalProps> = ({
  isCreateOpen,
  onCreateClose,
  user,
  getLoadoutHandler,
}) => {
  const initialValues = {
    name: '',
    switches: '',
    others: '',
  };

  const validationSchema = Yup.object().shape(
    {
      name: Yup.string()
        .max(25, 'Loadout name must be at most 25 characters')
        .required('Loadout name is required'),
      switches: Yup.string()
        .nullable()
        .notRequired()
        .when('switches', {
          is: (value: string) => value?.length,
          then: (rule) =>
            rule.max(25, 'Switch name must be at most 25 characters'),
        }),
      others: Yup.string()
        .nullable()
        .notRequired()
        .when('others', {
          is: (value: string) => value?.length,
          then: (rule) =>
            rule.max(25, 'Other information must be at most 25 characters'),
        }),
    },
    [
      ['switches', 'switches'],
      ['others', 'others'],
    ],
  );

  return (
    <Modal
      closeOnOverlayClick={false}
      isOpen={isCreateOpen}
      onClose={onCreateClose}
      isCentered
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create Loadout</ModalHeader>
        <ModalCloseButton />
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={(values, actions) => {
            const params = { ...values, username: user };
            createLoadout(params).then(() => {
              actions.setSubmitting(false);
              onCreateClose();
              getLoadoutHandler();
            });
          }}
        >
          {(props) => (
            <Form autoComplete='off'>
              <ModalBody>
                <Field name='name'>
                  {/* @ts-ignore */}
                  {({ field, form }) => (
                    <FormControl
                      isInvalid={form.errors.name && form.touched.name}
                    >
                      <FormLabel htmlFor='name'>Keyboard Name</FormLabel>
                      <Input {...field} />
                      <FormErrorMessage>{form.errors.name}</FormErrorMessage>
                    </FormControl>
                  )}
                </Field>
                <Field name='switches'>
                  {/* @ts-ignore */}
                  {({ field, form }) => (
                    <FormControl
                      isInvalid={form.errors.switches && form.touched.switches}
                      mt={4}
                    >
                      <FormLabel htmlFor='switches'>
                        Switches (optional)
                      </FormLabel>
                      <Input {...field} />
                      <FormErrorMessage>
                        {form.errors.switches}
                      </FormErrorMessage>
                    </FormControl>
                  )}
                </Field>
                <Field name='others'>
                  {/* @ts-ignore */}
                  {({ field, form }) => (
                    <FormControl
                      isInvalid={form.errors.others && form.touched.others}
                      mt={4}
                    >
                      <FormLabel htmlFor='name'>Others (optional)</FormLabel>
                      <Input {...field} />
                      <FormErrorMessage>{form.errors.others}</FormErrorMessage>
                    </FormControl>
                  )}
                </Field>
              </ModalBody>
              <ModalFooter>
                <Button onClick={onCreateClose}>Close</Button>
                <Button
                  ml={4}
                  colorScheme='accent'
                  isLoading={props.isSubmitting}
                  type='submit'
                >
                  Submit
                </Button>
              </ModalFooter>
            </Form>
          )}
        </Formik>
      </ModalContent>
    </Modal>
  );
};

export default CreateLoadoutModal;
