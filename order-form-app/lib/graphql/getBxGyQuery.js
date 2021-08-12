import gql from 'graphql-tag';

export default gql`
query getBxGyCode($code: String!){
  codeDiscountNodeByCode(code:$code) {
    id
    codeDiscount{
      ... on DiscountCodeBxgy{
        appliesOncePerCustomer
        asyncUsageCount
        codeCount
        createdAt
        endsAt
        startsAt
        status
        summary
        title
        usageLimit
        usesPerOrderLimit
        customerBuys{
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
              productVariants(first:100){
                edges{
                  node{
                    id
                    product{
                      handle
                    }
                  }
                }
              }
              products(first:100){
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
            ... on DiscountPurchaseAmount{
              amount
            }
            ... on DiscountQuantity{
              quantity
            }
          }
        }
        customerGets{
          items{
            ... on AllDiscountItems{
              allItems
            }
            ... on DiscountCollections{
              collections(first:100){
                edges{
                  node{
                    handle
                  }
                }
              }
            }
            ... on DiscountProducts{
              productVariants(first:100){
                edges{
                  node{
                    id
                    product{
                      handle
                    }
                  }
                }
              }
              products(first:100){
                edges{
                  node{
                    id
                    handle
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
`;