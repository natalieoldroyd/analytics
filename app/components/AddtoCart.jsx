
import React, {useEffect} from 'react';
import {CartForm, AnalyticsEventName, getClientBrowserParameters, sendShopifyAnalytics} from '@shopify/hydrogen';
import {usePageAnalytics} from '~/utils/usePageAnalytics';

export function AddToCartButton({
  children,
  lines,
  disabled,
  productAnalytics
}) {
  const analytics = {
    products: [productAnalytics]
  };

  return (
    <CartForm
      route="/cart"
      inputs={
        {lines}
      }
      action={CartForm.ACTIONS.LinesAdd}
    >
      {(fetcher) => {
        return (
          <AddToCartAnalytics fetcher={fetcher}>
            <input
              type="hidden"
              name="analytics"
              value={JSON.stringify(analytics)}
            />
            <button
              type="submit"

            >
              {children}
            </button>
          </AddToCartAnalytics>
        );
      }}
    </CartForm>
  );
}

function AddToCartAnalytics({
  fetcher,
  children,
}) {
  // Data from action response
  const fetcherData = fetcher.data;
  // Data in form inputs
  const formData = fetcher.formData;
  const pageAnalytics = usePageAnalytics({hasUserConsent: true})

  useEffect(() => {
    if (formData) {
      const cartData = {};
      const cartInputs = CartForm.getFormInput(formData);

      try {
        // Get analytics data from form inputs
        if (cartInputs.inputs.analytics) {
          const dataInForm = JSON.parse(
            String(cartInputs.inputs.analytics),
          );
          Object.assign(cartData, dataInForm);
        }
      } catch {
        console.error('Could not parse analytics data');
      }

      // If we got a response from the add to cart action
      if (Object.keys(cartData).length && fetcherData) {
        const addToCartPayload = {
          ...getClientBrowserParameters(),
          ...pageAnalytics,
          ...cartData,
          cartId: fetcherData.cart.id,
        };

        sendShopifyAnalytics({
          eventName: AnalyticsEventName.ADD_TO_CART,
          payload: addToCartPayload,
        });
      }

    }
  }, [fetcherData, formData, pageAnalytics]);
  return <>{children}</>;
}
