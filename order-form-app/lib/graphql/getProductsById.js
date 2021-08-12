import gql from 'graphql-tag';

export default gql`
  query getProducts($ids: [ID!]!) {
    nodes(ids: $ids) {
      ... on Product {
        title
        handle
        descriptionHtml
        id
        collections(first: 20){
          edges{
            node{
              handle
            }
          }
        }
        images(first: 1) {
          edges {
            node {
              originalSrc
              altText
            }
          }
        }
        variants(first: 10) {
          edges {
            node {
              id
              price
              title
            }
          }
        }
      }
    }
  }
`;