import gql from 'graphql-tag';

export default gql`
query getOrders($query: String!){
  orders(query: $query, first: 1){
    edges{
      node{
        discountCode
      }
    }
  }
}
`;