import gql from 'graphql-tag';

export default gql`
mutation discountCodeDeactivate{
  discountCodeDeactivate(id: "gid://shopify/DiscountCodeNode/661615673397") {
    codeDiscountNode {
      id
    }
    userErrors {
      code
      field
      message
    }
  }
}
`;