import gql from 'graphql-tag';

export default gql`
query getCustomerGroup($query: String!){
  customers(query: $query, first: 4){
    edges{
      node{
        email
      }
    }
  }
}
`;