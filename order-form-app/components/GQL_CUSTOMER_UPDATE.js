import gql from 'graphql-tag';
const CUSTOMER_UPDATE = gql`
mutation customerUpdate($input: CustomerInput!) {
  customerUpdate(input: $input) {
    customer {
      id
    }
    userErrors {
      field
      message
    }
  }
}
`;
export default CUSTOMER_UPDATE;