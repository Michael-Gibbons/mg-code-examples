import {useCallback, useState, useEffect} from 'react';
import {Stack, Card, Modal, TextContainer, TextField} from '@shopify/polaris';

export default function CustomerEmailEditModal({ customer, updateUserEmail, currentUserEmail }) {
  const [active, setActive] = useState(false);
  const [value, setValue] = useState(currentUserEmail);
  const handleChange = useCallback(() => setActive(!active), [active]);
  const handleTextChange = useCallback((newValue) => {
    setValue(newValue);
  }, []);
  const handleUpdate = useCallback(() => {
    updateUserEmail(value);
    setActive(false);
  }, [value]);

  useEffect(() => {
    setValue(value);
  }, [])

  return (
    <Card.Section title="Customer" actions={[{content: 'Edit', onAction: handleChange}]}>
      <div>{customer.firstName} {customer.lastName}</div>
      <div>{currentUserEmail}</div>
      <div>{customer.phone}</div>
      <Modal
        open={active}
        onClose={handleChange}
        title="Edit email"
        primaryAction={{
          content: 'Apply',
          onAction: handleUpdate,
        }}
        secondaryActions={[
          {
            content: 'Cancel',
            onAction: handleChange,
          },
        ]}
      >
        <Modal.Section>
          <Stack vertical>
            <Stack.Item>
              <TextContainer>
                <p>Notification emails will be sent to this address.</p>
             </TextContainer>
            </Stack.Item>
            <Stack.Item>
              <TextField value={value} label="Email" onChange={handleTextChange}></TextField>
            </Stack.Item>
          </Stack>
        </Modal.Section>
      </Modal>
    </Card.Section>
  );
}