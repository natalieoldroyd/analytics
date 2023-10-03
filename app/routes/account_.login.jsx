import {json, redirect} from '@shopify/remix-oxygen';
import {Form, Link, useActionData, useLoaderData} from '@remix-run/react';

export const meta = () => {
  return [{title: 'Login'}];
};

// export async function loader({context, request}) {
//   // if (await context.session.get('customerAccessToken')) {
//   //   return redirect('/account');
//   // }
//   // return json({});

//   const accessToken = context.session.get('customer_access_token')

//   if (!Boolean(accessToken)) return json({user: null});

//   const userAgent =
//   'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.93 Safari/537.36';

//   const origin = new URL(request.url).origin // Will be http://localhost:3000 in development or an oxygen generated host


//   const query = `query customer {
//     customer {
//       emailAddress {
//         emailAddress
//       }
//     }

//     orders(first: 10) {
//       createdAt
//       shipment_status
//     }

//   }`
// const variables = {}

// const user = await fetch(
//   "https://shopify.com/68829970454/account/customer/api/unstable/graphql",
//   {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//       'User-Agent': userAgent,
//       Origin: origin,
//       Authorization: accessToken,
//     },
//     body: JSON.stringify({
//       operationName: 'SomeQuery',
//       query,
//       variables: variables,
//     }),
//   },
//   ).then(async (response) => {
//     if (!response.ok) {
//       throw new Error(
//         `${response.status} (RequestID ${response.headers.get(
//           'x-request-id',
//         )}): ${await response.text()}`,
//       );
//     }
//     return ((await response.json())).data;
//   });

// return {
//   user,
// };
// }


// export async function action({request, context}) {
//   const {session, storefront} = context;

//   if (request.method !== 'POST') {
//     return json({error: 'Method not allowed'}, {status: 405});
//   }

//   try {
//     const form = await request.formData();
//     const email = String(form.has('email') ? form.get('email') : '');
//     const password = String(form.has('password') ? form.get('password') : '');
//     const validInputs = Boolean(email && password);

//     if (!validInputs) {
//       throw new Error('Please provide both an email and a password.');
//     }

//     const {customerAccessTokenCreate} = await storefront.mutate(
//       LOGIN_MUTATION,
//       {
//         variables: {
//           input: {email, password},
//         },
//       },
//     );

//     if (!customerAccessTokenCreate?.customerAccessToken?.accessToken) {
//       throw new Error(customerAccessTokenCreate?.customerUserErrors[0].message);
//     }

//     const {customerAccessToken} = customerAccessTokenCreate;
//     session.set('customerAccessToken', customerAccessToken);

//     return redirect('/account', {
//       headers: {
//         'Set-Cookie': await session.commit(),
//       },
//     });
//   } catch (error) {
//     if (error instanceof Error) {
//       return json({error: error.message}, {status: 400});
//     }
//     return json({error}, {status: 400});
//   }
// }

// export default function Login() {
//   const data = useActionData();
//   const {user} = useLoaderData();
//   const error = data?.error || null;

//   return (

//     <div>
//       {user ? (
//         <>
//           <div>
//             <b>
//               Welcome {user.customer.emailAddress.emailAddress}
//             </b>
//           </div>
//           <div>
//             <Form method='post' action='/account/logout'>
//               <button>Logout</button>
//             </Form>
//           </div>
//         </>
//       ) : null}
//       {!user ? (
//         <Form method="post" action="/authorize">
//           <button>Login</button>
//         </Form>
//       ) : null}
//     </div>
//   );
// }

// // NOTE: https://shopify.dev/docs/api/storefront/latest/mutations/customeraccesstokencreate
// const LOGIN_MUTATION = `#graphql
//   mutation login($input: CustomerAccessTokenCreateInput!) {
//     customerAccessTokenCreate(input: $input) {
//       customerUserErrors {
//         code
//         field
//         message
//       }
//       customerAccessToken {
//         accessToken
//         expiresAt
//       }
//     }
//   }
// `;


export async function loader({request, context}) {
  const accessToken = context.session.get('customer_access_token')

  if (!Boolean(accessToken)) return json({user: null});

  const userAgent =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.93 Safari/537.36';
  const origin = new URL(request.url).origin // Will be http://localhost:3000 in development or an oxygen generated host

  const query = `query customer {
      customer {
        emailAddress {
          emailAddress
        }
      }
    }`
  const variables = {}

  const user = await fetch(
    `https://shopify.com/68829970454/account/customer/api/unstable/graphql`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': userAgent,
        Origin: origin,
        Authorization: accessToken,
      },
      body: JSON.stringify({
        operationName: 'SomeQuery',
        query,
        variables: variables,
      }),
    },
    ).then(async (response) => {
      if (!response.ok) {
        throw new Error(
          `${response.status} (RequestID ${response.headers.get(
            'x-request-id',
          )}): ${await response.text()}`,
        );
      }
      return ((await response.json())).data;
    });

  return {
    user,
  };
}

export default function () {
  const {user} = useLoaderData();

  return (

    <div>
      {user ? (
        <>
          <div>
            <b>
              Welcome {user.customer.emailAddress.emailAddress}
            </b>
          </div>
          <div>
            <Form method='post' action='/account/logout'>
              <button>Logout</button>
            </Form>
          </div>
        </>
      ) : null}
      {!user ? (
        <Form method="post" action="/authorize">
          <button>Login</button>
        </Form>
      ) : null}
    </div>
  );
}
