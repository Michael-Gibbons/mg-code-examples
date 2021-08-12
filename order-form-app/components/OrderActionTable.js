import { Layout } from '@shopify/polaris';
import DiscountPopup from './DiscountPopup';
import TaxesPopup from './TaxesPopup';
import ShippingPopup from './ShippingPopup';
import DiscountCodePicker from './DiscountCodePicker';
import {useState} from 'react';
import { useSelector } from 'react-redux';
import { getTaxExempt } from '../store/selectors';

export default function OrderActionTable({ draftOrderOutput, salesforceCustomer, shippingAddress, setBannerError }){
  const taxExempt = useSelector(getTaxExempt);
  const [disableOrderDiscount, setDisableOrderDiscount] = useState(false);
  const printOrderProperty = (prop) => {
    if(Object.entries(draftOrderOutput).length > 0){
      return '$' + draftOrderOutput.draftOrderCalculate.calculatedDraftOrder[prop];
    }
    return '$0.00'
  }
  const getDiscount = () => {
    if(Object.entries(draftOrderOutput).length > 0){
      const discount = draftOrderOutput.draftOrderCalculate.calculatedDraftOrder.appliedDiscount;
      if(discount){
        if(discount.valueType == 'FIXED_AMOUNT'){
          return "- " + '$' + parseFloat(discount.value).toFixed(2);
        }
        return "- " + "$"+ parseFloat(discount.amountV2.amount).toFixed(2);
      }
    }
    return '$0.00';
  }
    return (
      <Layout.Section secondary>
        <table className="table--no-border" style={{width: '100%'}}>
        <tbody>
          <tr>
            <td className="type--right">
              <DiscountCodePicker
                salesforceCustomer={salesforceCustomer}
                draftOrderOutput={draftOrderOutput}
                shippingAddress={shippingAddress}
                setBannerError={setBannerError}
                setDisableOrderDiscount={setDisableOrderDiscount}
              ></DiscountCodePicker>
            </td>
          </tr>
          <tr>
            <td className="type--right">
              <DiscountPopup
                draftOrderOutput={draftOrderOutput}
                disableOrderDiscount={disableOrderDiscount}
              ></DiscountPopup>
            </td>
            <td className="type--right">
              <span className="type--subdued">{getDiscount()}</span>
            </td>
          </tr>
          <tr>
            <td className="type--right type--subdued">
              Subtotal
            </td>
            <td className="type--right">
              {printOrderProperty("subtotalPrice")}
            </td>
          </tr>
          <tr>
            <td className="type--right">
              <ShippingPopup draftOrderOutput={ draftOrderOutput }></ShippingPopup>
            </td>
            <td className="type--right">
              <span className="type--subdued">{printOrderProperty("totalShippingPrice")}</span>
            </td>
          </tr>
        </tbody>
        <tbody className="next-table--row-group-no-spacing">
          <tr>
            <td className="type--right type--subdued">
            <TaxesPopup exempt={taxExempt}></TaxesPopup>
            </td>
            <td className="type--right">
            {printOrderProperty("totalTax")}
            </td>
          </tr>
        </tbody>
        <tbody>
          <tr>
            <td className="type--right type--subdued">
              Total
            </td>
            <td className="type--right">
            {printOrderProperty("totalPrice")}
            </td>
          </tr>
        </tbody>
      </table>
    </Layout.Section>
    );
}
