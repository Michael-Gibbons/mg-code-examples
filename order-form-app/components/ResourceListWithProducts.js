import { useQuery } from 'react-apollo';
import { ResourceList, Stack, TextStyle, Thumbnail, Spinner, Button } from '@shopify/polaris';
import { isSubscription, mapQuantityToVariant } from '../lib/variants';
import ProductQuantitySelector from './ProductQuantitySelector'
import { useEffect, useState } from 'react';
import RechargeSubscriptionItem from './RechargeSubscriptionItem';
import DeleteLineItem from './DeleteLineItem';
import DiscountPopupItem from './DiscountPopupItem';
import getProductsById from '../lib/graphql/getProductsById';
import { useDispatch, shallowEqual, useSelector } from 'react-redux';
import { getLineItems, getDraftOrderOutput } from '../store/selectors';
import { setLineItems } from '../store/actions';

export default function ResourceListWithProducts() {
  const dispatch = useDispatch();
  const lineItems = useSelector(getLineItems, shallowEqual);
  const draftOrderOutput = useSelector(getDraftOrderOutput, shallowEqual);
  const [calculatedLineItems, setCalculatedLineItems] = useState([]);
  const { loading, error, data: { nodes: products } = {} } = useQuery(getProductsById, {
    variables: {
      ids: lineItems.map(item => item.productId),
    },
  });

  const storeCollectionsAndVariants = (products) => {
    const updatedItems = lineItems.map(item => {
      const product = products.find(product => product.id === item.productId);
      const itemWithQuantityPrice = mapQuantityToVariant({
        ...item,
        collections: product.collections.edges.map(collection => collection.node.handle),
        variants: product.variants.edges.map(variant => variant.node),
      });
      return itemWithQuantityPrice;
    });
    dispatch(setLineItems(updatedItems));
  };

  const updateLineItemDiscount = (appliedDiscount, item) => {
    const newLineItems = [...lineItems];
    const itemToDiscount = newLineItems.find(lineItem => lineItem.id === item.id);
    itemToDiscount.appliedDiscount = appliedDiscount;
    dispatch(setLineItems(newLineItems));
  };

  useEffect(() => {
    if (Object.entries(draftOrderOutput).length > 0) {
      setCalculatedLineItems(draftOrderOutput.draftOrderCalculate.calculatedDraftOrder.lineItems);
    }
  }, [draftOrderOutput.draftOrderCalculate]);

  useEffect(() => {
    if (products && products.length) {
      storeCollectionsAndVariants(products);
    }
  }, [products]);

  if (loading) {
    return (
      <div style={{display: 'flex',  justifyContent:'center', alignItems:'center',height: '200px'}}>
        <Spinner accessibilityLabel="Spinner" size="large" color="teal" />
      </div>
    );
  }

  if (error) {
    return <div>{error.message}</div>;
  }

  if (!products || !products.length) {
    return null;
  }

  return (
    <ResourceList
      showHeader
      resourceName={{ singular: 'Product', plural: 'Products' }}
      items={calculatedLineItems}
      renderItem={(calculatedItem, index) => {
        const calculatedItemID = calculatedItem.customAttributes.find(item => item.key === 'id').value;
        let foundLineItem = {};
        lineItems.forEach(lineItem => {
          let lineItemID = lineItem.customAttributes.find(item => item.key === 'id').value;
          if(lineItemID === calculatedItemID){
            foundLineItem = lineItem;
          }
        });
        const product = products.find(product => calculatedItem.product.handle === product.handle);
        if (! product) {
          return null;
        }
        const originalItem = foundLineItem;
        const unitPrice = '$' + parseFloat(calculatedItem.discountedUnitPrice.amount).toFixed(2);
        const linePrice = '$' + parseFloat(calculatedItem.discountedTotal.amount).toFixed(2);

        return (
          <ResourceList.Item
            id={index}
            accessibilityLabel={`View details for ${product.title}`}
          >
            <Stack alignment='center'>
              <Stack.Item>
                <Thumbnail
                source={ product.images.edges[0] ? product.images.edges[0].node.originalSrc : '' }
                alt={ product.images.edges[0] ? product.images.edges[0].node.altText: '' }
                />
              </Stack.Item>
              <Stack.Item fill>
                <h3 style={{width:'200px'}}>
                  <TextStyle variation="strong">
                    {product.title}
                  </TextStyle>
                </h3>
              </Stack.Item>
              <Stack.Item>
                <DiscountPopupItem
                  updateLineItemDiscount={updateLineItemDiscount}
                  originalItem={originalItem}
                ></DiscountPopupItem>
              </Stack.Item>
              <Stack.Item>
                <DeleteLineItem
                  lineItem={foundLineItem}
                ></DeleteLineItem>
              </Stack.Item>
            </Stack>
            <Stack alignment='center'>
              <Stack.Item>
                <div style={{width:'60px'}}></div>
              </Stack.Item>
              <Stack.Item>
                <p>{unitPrice}</p>
              </Stack.Item>
              <Stack.Item>
                <p>x</p>
              </Stack.Item>
              <Stack.Item>
                <ProductQuantitySelector
                  lineItems={lineItems}
                  lineItem={foundLineItem}
                  updateLineItems={(updatedItems) => dispatch(setLineItems(updatedItems))}
                ></ProductQuantitySelector>
              </Stack.Item>
              <Stack.Item>
                <p>{linePrice}</p>
              </Stack.Item>
            </Stack>
            {isSubscription(product) ? (
              <Stack>
              <Stack.Item>
                <div style={{width:'60px'}}></div>
              </Stack.Item>
              <Stack.Item>
                <RechargeSubscriptionItem calculatedItem={calculatedItem} originalItem={originalItem}/>
              </Stack.Item>
              </Stack>
            ): (<span></span>)}
          </ResourceList.Item>
        );
      }}
    />
  );
}