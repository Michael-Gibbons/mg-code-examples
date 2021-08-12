require("dotenv").config();
const withCSS = require('@zeit/next-css');
const webpack = require('webpack');

const apiKey = JSON.stringify(process.env.SHOPIFY_API_KEY);
const AUTHORIZE_CLIENT_KEY = JSON.stringify(process.env.AUTHORIZE_CLIENT_KEY);
const AUTHORIZE_LOGIN_ID = JSON.stringify(process.env.AUTHORIZE_LOGIN_ID);

module.exports = withCSS({
  webpack: (config) => {
    const env = {
      API_KEY: apiKey,
      ACCEPT_JS_SRC: JSON.stringify(
        process.env.NODE_ENV === 'production' ? 'https://js.authorize.net/v1/Accept.js' : 'https://jstest.authorize.net/v1/Accept.js'
      ),
      AUTHORIZE_CLIENT_KEY: AUTHORIZE_CLIENT_KEY,
      AUTHORIZE_LOGIN_ID: AUTHORIZE_LOGIN_ID
    };
    config.plugins.push(new webpack.DefinePlugin(env));
    config.externals.push('Accept');
    return config;
  },
});