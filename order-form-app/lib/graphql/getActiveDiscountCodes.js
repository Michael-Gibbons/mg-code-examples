import gql from 'graphql-tag';

export default gql`
mutation {
  bulkOperationRunQuery(
   query: """
{
  codeDiscountNodes(query:"status:active") {
    edges {
      node {
        id
        codeDiscount{
          ... on DiscountCodeBasic{
            appliesOncePerCustomer
            asyncUsageCount
            codeCount
            createdAt
            customerGets{
              items{
                ... on AllDiscountItems{
                  allItems
                }
                ... on DiscountCollections{
                  collections{
                    edges{
                      node{
                        handle
                      }
                    }
                  }
                }
                ... on DiscountProducts{
                  productVariants{
                    edges{
                      node{
                        id
                        product{
                          handle
                        }
                      }
                    }
                  }
                  products{
                    edges{
                      node{
                        id
                        handle
                      }
                    }
                  }
                }
              }
              value{
                ... on DiscountAmount{
                  amount{
                    amount
                    currencyCode
                  }
                  appliesOnEachItem
                }
                ... on DiscountOnQuantity{
                  effect{
                    ... on DiscountPercentage{
                      percentage
                    }
                  }
                  quantity{
                    quantity
                  }
                }
                ... on DiscountPercentage{
                  percentage
                }
              }
            }
            customerSelection{
              ... on DiscountCustomerAll{
                allCustomers
              }
              ... on DiscountCustomerSavedSearches{
                savedSearches {
                  query
                }
              }
              ... on DiscountCustomers{
                customers{
                  email
                }
              }
            }
            minimumRequirement {
              ... on DiscountMinimumQuantity {
                greaterThanOrEqualToQuantity
              }
              ... on DiscountMinimumSubtotal {
                greaterThanOrEqualToSubtotal {
                  amount
                  currencyCode
                }
              }
            }
            endsAt
            shortSummary
            startsAt
            status
            summary
            title
            usageLimit

          }
          ... on DiscountCodeFreeShipping{
            appliesOncePerCustomer
            asyncUsageCount
            codeCount
            createdAt
            customerSelection{
              ... on DiscountCustomerAll{
                allCustomers
              }
              ... on DiscountCustomerSavedSearches{
                savedSearches {
                  query
                }
              }
              ... on DiscountCustomers{
                customers{
                  email
                }
              }
            }
            minimumRequirement {
              ... on DiscountMinimumQuantity {
                greaterThanOrEqualToQuantity
              }
              ... on DiscountMinimumSubtotal {
                greaterThanOrEqualToSubtotal {
                  amount
                  currencyCode
                }
              }
            }
            destinationSelection{
              ... on DiscountCountries{
                countries
                includeRestOfWorld
              }
              ... on DiscountCountryAll{
                allCountries
              }
            }
            endsAt
            shortSummary
            startsAt
            status
            summary
            title
            usageLimit
          }
        }
      }
    }
  }
}

    """
  ) {
    bulkOperation {
      id
      status
    }
    userErrors {
      field
      message
    }
  }
}
`;