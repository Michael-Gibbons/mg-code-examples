export const getRawVariantId = graphqlVariantId => graphqlVariantId.replace(/\D/g,'');
export const isSubscription = variant => variant.title && variant.title.toLowerCase().indexOf("auto renew") !== -1;
export const mapQuantityToVariant = (lineItem) => {
  if (!lineItem.variants.length) {
    return lineItem;
  }

  const quantityDiscountedVariant = lineItem.variants.find(variant => variant.title.includes('2+'));
  const singleVariant = lineItem.variants.find(variant => variant.title === '1' || variant.title.startsWith('1 '));

  if (lineItem.quantity > 1 && quantityDiscountedVariant && lineItem.variantId !== quantityDiscountedVariant.id) {
    lineItem.variantId = quantityDiscountedVariant.id;
    lineItem.originalPrice = quantityDiscountedVariant.price;
    return lineItem;
  }

  if (lineItem.quantity < 2 && singleVariant && lineItem.variantId !== singleVariant.id) {
    lineItem.variantId = singleVariant.id;
    lineItem.originalPrice = singleVariant.price;
  }

  return lineItem;
}