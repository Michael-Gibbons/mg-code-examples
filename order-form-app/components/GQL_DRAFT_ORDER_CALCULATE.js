import gql from 'graphql-tag';
const DRAFT_ORDER_CALCULATE = gql`
  mutation draftOrderCalculate($input: DraftOrderInput!) {
    draftOrderCalculate(input: $input) {
      calculatedDraftOrder {
        appliedDiscount {
          amountV2 {
            amount
            currencyCode
          }
          description
          title
          value
          valueType
        }
        availableShippingRates {
          handle
          price {
            amount
            currencyCode
          }
          title
        }
        lineItems {
          discountedTotal {
            amount
            currencyCode
          }
          discountedUnitPrice{
            amount
            currencyCode
          }
          originalTotal {
            amount
            currencyCode
          }
          originalUnitPrice {
            amount
            currencyCode
          }
          product {
            handle
          }
          customAttributes{
            key
            value
          }
          quantity
        }
        subtotalPrice
        totalPrice
        totalShippingPrice
        totalTax
      }
      userErrors {
        field
        message
      }
    }
  }`;
export default DRAFT_ORDER_CALCULATE;