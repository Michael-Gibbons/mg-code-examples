import gql from 'graphql-tag';
const DRAFT_ORDER_CREATE = gql`
mutation draftOrderCreate($input: DraftOrderInput!) {
  draftOrderCreate(input: $input) {
    draftOrder {
      id
    }
    userErrors {
      field
      message
    }
  }
}
`;
export default DRAFT_ORDER_CREATE;