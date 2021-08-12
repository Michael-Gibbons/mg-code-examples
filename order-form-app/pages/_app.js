
import App from 'next/app';
import Head from 'next/head';
import { AppProvider } from '@shopify/polaris';
import { Provider } from '@shopify/app-bridge-react';
import Cookies from "js-cookie";
import '@shopify/polaris/styles.css';
import ApolloClient from 'apollo-boost';
import { ApolloProvider } from 'react-apollo';
import fetch from 'node-fetch';
import { Provider as StoreProvider } from 'react-redux';
import store from '../store';

const client = new ApolloClient({
  fetch: fetch,
  fetchOptions: {
    credentials: 'include'
  },
});

class MyApp extends App {
  render() {
    const { Component, pageProps } = this.props;
    const config = { apiKey: API_KEY, shopOrigin: Cookies.get("shopOrigin"), forceRedirect: true };

    return (
      <React.Fragment>
        <Head>
          <title>MyEllura</title>
          <meta charSet="utf-8" />
          <script src={ACCEPT_JS_SRC}></script>
        </Head>
        <Provider config={config}>
          <AppProvider>
          <ApolloProvider client={client}>
            <StoreProvider store={store}>
              <Component {...pageProps} />
            </StoreProvider>
          </ApolloProvider>
          </AppProvider>
        </Provider>
      </React.Fragment>
    );
  }
}

export default MyApp;