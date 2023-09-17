import {
    AnalyticsEventName,
    CartForm,
    getClientBrowserParameters,
    sendShopifyAnalytics,
  } from '@shopify/hydrogen';
  import {useEffect} from 'react';

  import {usePageAnalytics} from '../utils/utils';

  export function AddToCartButton({
    children,
    lines,
    disabled,
    analytics,
  }) {
    return (
      <CartForm
        route="/cart"
        inputs={
          {lines}
        }
        action={CartForm.ACTIONS.LinesAdd}
      >
        {
          (fetcher) => {
            return (
              <AddToCartAnalytics fetcher={fetcher}>
                <input
                  type="hidden"
                  name="analytics"
                  value={JSON.stringify(analytics)}
                />
                <button
                  type="submit"
                  disabled={disabled ?? fetcher.state !== 'idle'}
                >
                  {children}
                </button>
              </AddToCartAnalytics>
            );
          }
        }
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
    // Data from loaders
    const pageAnalytics = usePageAnalytics({hasUserConsent: true});

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
          console.error(error)
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
