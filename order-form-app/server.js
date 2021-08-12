require('isomorphic-fetch');
require('dotenv').config();
const Koa = require('koa');
var Router = require('koa-router');
const koaBody = require('koa-body')
const crypto = require('crypto');
const axios = require('axios');
const next = require('next');
const { default: createShopifyAuth } = require('./lib/koa-shopify-auth');
const { verifyRequest } = require('@shopify/koa-shopify-auth');
const session = require('koa-session');
const { default: graphQLProxy } = require('@shopify/koa-shopify-graphql-proxy');
const { ApiVersion } = require('@shopify/koa-shopify-graphql-proxy');
// const Queue = require('node-persistent-queue');

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
// const q = new Queue('./worker/queue.sqlite');

const { SHOPIFY_API_SECRET_KEY, SHOPIFY_API_KEY } = process.env;
const { createCustomerProfile } = require('./middleware/authorizeCreateCustomerProfile');
const { getAnAcceptPaymentPage } = require('./middleware/authorizeGetAcceptPaymentToken');
const { getCustomerProfile } = require('./middleware/authorizeGetCustomerProfile');
const { createCustomerPaymentProfile } = require('./middleware/authorizeCreateCustomerPaymentProfile');
const { getAddresses, createAddress, createOneTime, createSubscriptions, getCustomer, createCustomer } = require('./requests/recharge');



app.prepare().then(() => {
  const server = new Koa();
  var router = new Router();
  server.use(session({ sameSite: 'none', secure: true }, server));
  server.keys = [SHOPIFY_API_SECRET_KEY];

  server.use(
    createShopifyAuth({
      apiKey: SHOPIFY_API_KEY,
      secret: SHOPIFY_API_SECRET_KEY,
      scopes: ['read_products', 'write_products', 'write_draft_orders','read_discounts', 'write_discounts', 'read_orders', 'write_orders', 'read_customers'],
      afterAuth(ctx) {
        const { shop, accessToken, staffMember } = ctx.session;
        ctx.cookies.set("shopOrigin", shop, {
          httpOnly: false,
          secure: true,
          sameSite: 'none',
        });
        ctx.cookies.set("staffMember", `${staffMember.first_name} ${staffMember.last_name}`, {
          httpOnly: false,
          secure: true,
          sameSite: 'none',
        });
        ctx.redirect('/');
      },
    }),
  );
  router.post("/authorizeCreateCustomerProfile", koaBody() ,ctx => {
    console.log(ctx.request.body)
    return new Promise(function(resolve, reject) {
      createCustomerProfile(function(result) {
          ctx.body = result;
          resolve();
      },ctx.request.body)
    });
  });
  router.post("/authorizeCreateCustomerPaymentProfile", koaBody() ,ctx => {
    console.log(ctx.request.body)
    return new Promise(function(resolve, reject) {
      createCustomerPaymentProfile(function(result) {
          ctx.body = result;
          resolve();
      },ctx.request.body)
    });
  });
  router.get("/authorizeGetAcceptFormToken", ctx => {
    return new Promise(function(resolve, reject) {
      getAnAcceptPaymentPage(function(result) {
          ctx.body = result;
          resolve();
      })
    });
  });
  router.post("/getCustomerProfile", koaBody() , ctx => {
    return new Promise(function(resolve, reject) {
      getCustomerProfile(function(result) {
          ctx.body = result;
          resolve();
      },ctx.request.body)
    });
  });

  router.post("/rechargeCreateCustomer", koaBody(), async ctx => {
    try {
      const { billingAddress, salesforceCustomer } = ctx.request.body;
      const response = await createCustomer({
        email: salesforceCustomer.email,
        first_name: salesforceCustomer.firstName,
        last_name: salesforceCustomer.lastName,
        billing_first_name: billingAddress.firstName,
        billing_last_name: billingAddress.lastName,
        billing_address1: billingAddress.address1,
        billing_zip: billingAddress.zip,
        billing_city: billingAddress.city,
        billing_province: billingAddress.provinceCode,
        billing_country: billingAddress.country,
        billing_phone:billingAddress.phone,
        billing_company: billingAddress.company,
        processor_type: 'authorizedotnet',
        authorizedotnet_profile_id: ctx.request.body.userAnetProfileID,
        authorizedotnet_payment_profile_id: ctx.request.body.userAnetPaymentProfileID,
      });
      ctx.body = await response.data
    } catch({response: {data}}) {
      console.log(data.errors)
      ctx.body = data.errors
    }
  });

  router.get('/rechargeGetCustomer', koaBody(), async ctx => {
    try{
      const { email } = ctx.request.query;
      const response = await getCustomer(email);
      ctx.body = await response.data;
    }catch({response: {data}}){
      console.log("ERRORS",data.error)
      ctx.body = data.error
    }
  });

  router.post('/rechargeCreateAddress', koaBody(), async ctx => {
    try {
      const { customerID, shippingAddress, customAttributes } = ctx.request.body;
      const response = await createAddress(customerID, {
        "first_name": shippingAddress.firstName,
        "last_name": shippingAddress.lastName,
        "address1": shippingAddress.address1,
        "address2": shippingAddress.address2,
        "zip": shippingAddress.zip,
        "city": shippingAddress.city,
        "province": shippingAddress.provinceCode,
        "country": shippingAddress.country,
        "phone":shippingAddress.phone,
        "company": shippingAddress.company,
        "note_attributes": customAttributes.map(({ key, value }) => ({ name: key, value })),
      });
      ctx.body = await response.data;
    } catch({ response: { data } }) {
      console.log(data.errors)
      ctx.body = data.errors
    }
  });

  router.get('/rechargeGetAddresses', koaBody(), async ctx => {
    try{
      const response = await getAddresses(ctx.request.query.id);
      ctx.body = await response.data;
    } catch({response: {data}}) {
      console.log("ERRORS",data.error)
      ctx.body = data.error
    }
  });

  router.post('/rechargeCreateSubscription', koaBody(), async ctx => {
    try {
      const { address_id, subscriptions } = ctx.request.body.data;
      const response = await createSubscriptions(address_id, subscriptions);
      ctx.body = await response.data;
    } catch({ response }) {
      console.log("ERRORS", response);
      ctx.body = response.data && response.data.error ? response.data.error : response.statusText;
    }
  });

  router.post('/rechargeCreateOnetime', koaBody(), async ctx => {
    try {
      const { data: onetime } = ctx.request.body;
      const response = await createOneTime(onetime.address_id, onetime);
      ctx.body = await response.data;
    } catch(err) {
      console.log("ERRORS",err)
      ctx.body = err
    }
  });

  router.post('/getDiscountCodes', koaBody(), async ctx => {
    try {
      const { dataUrl } = ctx.request.body;
      const response = await axios.get(`${dataUrl}`);
      const lines = response.data.split('\n');
      // codes come as JSON objects, one per line, with blank line at end to be discarded
      const discountCodes = lines.slice(0, lines.length - 1).reduce((carry, codeString) => {
        const code = JSON.parse(codeString);
        code.items = [];
        code.itemsType = null;
        console.log({ code });

        if (!code.__parentId) {
          carry.push(code);
          return carry;
        }

        // child objects indicate a product or collection that the parent code is valid for
        const parent = carry.find((item) => item.id === code.__parentId);
        if (code.id || code.product) {
          parent.itemsType = 'PRODUCT'
        } else if (code.handle) {
          parent.itemsType = 'COLLECTION'
        }
        parent.items.push(code);

        return carry;
      }, []);
      ctx.body = { discountCodes };
    } catch(err) {
      ctx.body = err
    }
  });

  router.post('/webhooks/recharge/order-created', async ctx => {
    // const { body } = ctx.request;
    // const signature = ctx.request.get('X-Recharge-Hmac-Sha256');
    // const hash = crypto.createHash('sha256').update(`${process.env.RECHARGE_API_KEY}${body}`).digest('base64');
    // if (hash === signature) {
    //   await q.add(body);
    // }
    ctx.status = 200;
    ctx.body = 'OK';
  });





  server.use(router.allowedMethods());
  server.use(router.routes());
  server.use(graphQLProxy({version: ApiVersion.October19}))
  server.use(verifyRequest());
  server.use(async (ctx) => {
    await handle(ctx.req, ctx.res);
    ctx.respond = false;
    ctx.res.statusCode = 200;
  });

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});