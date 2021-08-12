const axios = require('axios');
const headers = {
  "X-Recharge-Access-Token": process.env.RECHARGE_API_KEY,
  'Accept': 'application/json',
  'Content-Type': 'application/json',
};

async function getCustomer(email) {
  return axios.get(`https://api.rechargeapps.com/customers`, { headers, params: { email } });
}

async function createCustomer(customer) {
  return axios.post('https://api.rechargeapps.com/customers', customer, { headers });
}

async function getAddress(addressId) {
  return axios.get(`https://api.rechargeapps.com/addresses/${addressId}`, { headers });
}

async function getAddresses(customerId) {
  return axios.get(`https://api.rechargeapps.com/customers/${customerId}/addresses`, { headers });
}

async function createAddress(customerId, address) {
  return axios.post(`https://api.rechargeapps.com/customers/${customerId}/addresses`, address, { headers });
}

async function addDiscountToAddress(addressId, discountCode) {
  return axios.post(`https://api.rechargeapps.com/addresses/${addressId}/apply_discount`, { discount_code: discountCode }, { headers });
}

async function createOneTime(addressId, onetime) {
  return axios.post(`https://api.rechargeapps.com/addresses/${addressId}/onetimes`, onetime, { headers });
}

async function createSubscriptions(addressId, subscriptions) {
  return axios.post(`https://api.rechargeapps.com/addresses/${addressId}/subscriptions-bulk`, { subscriptions }, { headers });
}

async function updateSubscriptions(addressId, updates) {
  return axios.post(`https://api.rechargeapps.com/addresses/${addressId}/subscriptions-bulk`, updates, { headers });
}

async function getWebhooks() {
  const { data: { webhooks } } = await axios.get('https://api.rechargeapps.com/webhooks', { headers });
  return webhooks.filter(({ address }) => address.includes(process.env.WEBHOOK_DOMAIN));
}

async function createWebhook(topic, endpoint) {
  return axios.post('https://api.rechargeapps.com/webhooks', { topic, address: `https://${process.env.WEBHOOK_DOMAIN}/${endpoint}` }, { headers });
}

module.exports = {
  getCustomer,
  createCustomer,
  getAddress,
  getAddresses,
  createAddress,
  addDiscountToAddress,
  createOneTime,
  createSubscriptions,
  updateSubscriptions,
  getWebhooks,
  createWebhook,
};