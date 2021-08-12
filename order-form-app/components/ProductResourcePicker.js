import { Button, TextField, Icon, Layout } from '@shopify/polaris';
import { ResourcePicker } from '@shopify/app-bridge-react';
import { useState } from 'react';
import { useSelector, shallowEqual, useDispatch } from 'react-redux';

import ResourceListWithProducts from './ResourceListWithProducts';
import { setLineItems } from '../store/actions';
import { getLineItems } from '../store/selectors';
import { isSubscription, mapQuantityToVariant } from '../lib/variants';
import hat from 'hat';
const rack = hat.rack();

const searchIcon = (
  <Icon source='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M8 12c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm9.707 4.293l-4.82-4.82C13.585 10.493 14 9.296 14 8c0-3.313-2.687-6-6-6S2 4.687 2 8s2.687 6 6 6c1.296 0 2.492-.415 3.473-1.113l4.82 4.82c.195.195.45.293.707.293s.512-.098.707-.293c.39-.39.39-1.023 0-1.414z"></path></svg>'/>
)

export default function ProductResourcePicker() {
  const dispatch = useDispatch();
  const lineItems = useSelector(getLineItems, shallowEqual);
  const [active, setActive] = useState(false);
  const [value, setValue] = useState('');
  const emptyState = !lineItems.length;

  const handleSelection = (resources) => {
    if (resources) {
      const newLineItems = resources.selection.map((product) => product.variants.map((variant) => {
        const itemID = rack();
        const item = {
          id: itemID,
          variantId: variant.id,
          quantity: 1,
          title: product.title,
          productId: product.id,
          handle: product.handle,
          disableLineItemDiscounts: false,
          price: variant.price,
          originalPrice: variant.price,
          singular: false,
          customAttributes: [{ key: "id", value: itemID }],
          collections: [],
          variants: [],
        };
        if (isSubscription(product)) {
          item.order_interval_unit = 'month';
          item.order_interval_frequency = '1';
          item.charge_interval_frequency = '1';
        }
        return item;
      })).reduce((carry, items) => carry.concat(items), []);

      const lineItemsCopy = [...lineItems];
      const uniques = [...newLineItems];
      const duplicates = lineItemsCopy.filter(lineItem => {
        const foundDuplicate = newLineItems.find(item => !lineItem.singular && item.variantId === lineItem.variantId);
        if (foundDuplicate) {
          const foundDuplicateIndex = uniques.find(item => item.variantId === lineItem.variantId);
          uniques.splice(foundDuplicateIndex, 1);
          return true;
        }
      });

      duplicates.forEach(duplicate => {
        const foundLineItemIndex = lineItemsCopy.findIndex(lineItem => lineItem.id === duplicate.id);
        lineItemsCopy[foundLineItemIndex].quantity += 1;
      });

      const newItemsWithQuantityDiscount = [...lineItemsCopy, ...uniques].map(item => mapQuantityToVariant(item));

      dispatch(setLineItems(newItemsWithQuantityDiscount));
      setActive(false);
    }
  };


  return (
    <Layout.Section>
      <ResourcePicker
        resourceType="Product"
        showVariants={true}
        open={active}
        onSelection={handleSelection}
        onCancel={() => setActive(false)}
      />
      { emptyState ? (
        <div>
        <TextField
            label=""
            value={value}
            onChange={() => setActive(true)}
            placeholder="Search Products"
            autoComplete={ false }
            autoFocus={ false }
            prefix={searchIcon}
            connectedRight={
              <Button onClick={() => setActive(true)}>Browse Products</Button>
            }
          />
        </div>
        ) : (
        <div>
          <TextField
              label=""
              value={value}
              onChange={() => setActive(true)}
              placeholder="Search Products"
              autoComplete={ false }
              autoFocus={ false }
              prefix={searchIcon}
              connectedRight={
                <Button onClick={() => setActive(true)}>Browse Products</Button>
              }
            />

          <ResourceListWithProducts/>
        </div>
      )}
    </Layout.Section>
  );
}

