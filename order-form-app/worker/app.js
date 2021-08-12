require('dotenv').config();
const Queue = require('node-persistent-queue');
const { updateSubscriptions, getAddress, addDiscountToAddress } = require('../requests/recharge');

const discountCode = '5OFF';
const q = new Queue('./queue.sqlite');

q.on('next', async (webhookBody) => {
  const { order: { is_prepaid, address_id, line_items } = {} } = JSON.parse(webhookBody);

  if (is_prepaid || !address_id) {
    q.done();
  }

  const lineItemsForUpdate = line_items.filter(item => item.properties.some(prop => prop.name === 'Recurring Price'));

  if (lineItemsForUpdate.length) {
    const updates = lineItemsForUpdate.map(({ id, properties }) => {
      const { value } = properties.find(prop => prop.name === 'Recurring Price');
      const recurringPrice = parseFloat(value.replace(/[^0-9\.]/g, ''));
      const newProperties = properties.filter(prop => prop.name !== 'Recurring Price');
      return { id, price: recurringPrice, properties: newProperties };
    });
    try {
      await updateSubscriptions(updates);
      console.log({ updates });
    } catch({ response: { data } }) {
      console.error(data);
    }
  }

  try {
    // add $5 discount code to address if not already present so entire order will get $5 off starting with second occurrence
    const { data: { address } = {} } = await getAddress(address_id);
    if (!address.discount_id) {
      console.log({ discountCode });
      // TODO: remove CSR name and discount code from attributes if present so they're not included on every future order
      await addDiscountToAddress(address_id, discountCode);
    }
  } catch({ response: { data } }) {
    console.error(data);
  }

  q.done();
});

async function boot() {
  try {
    const webhooks = await getWebhooks();
    if (!webhooks.length) {
      await createWebhook('order/created', 'webhooks/recharge/order-created');
    }
    q.open().then(() => q.start());
  } catch({ response }) {
    console.log('Failed to boot worker');
    console.error(response);
    process.exit(1);
  }
}

boot();