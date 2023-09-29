import {json, redirect} from '@shopify/remix-oxygen';
import {Form, Link, useActionData, useLoaderData} from '@remix-run/react';
import {HydrogenSession} from 'server';

export const meta = () => {
  return [{title: 'Login'}];
};

export async function loader({context, request}) {
  // if (await context.session.get('customerAccessToken')) {
  //   return redirect('/account');
  // }
  // return json({});

  const accessToken = context.session.get('customer_access_token')

  const loggedIn = await isLoggedIn(context.session);
  if (!loggedIn) return json({user: null});

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
  `https://shopify.com/68829970454/account/customer/api/${context.env.CUSTOMER_API_VERSION}/graphql`,
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
  isLoggedIn,
  accessToken,
  exchangeAccessToken
};
}


export async function action({request, context}) {
  const {session, storefront} = context;

  if (request.method !== 'POST') {
    return json({error: 'Method not allowed'}, {status: 405});
  }

  try {
    const form = await request.formData();
    const email = String(form.has('email') ? form.get('email') : '');
    const password = String(form.has('password') ? form.get('password') : '');
    const validInputs = Boolean(email && password);

    if (!validInputs) {
      throw new Error('Please provide both an email and a password.');
    }

    const {customerAccessTokenCreate} = await storefront.mutate(
      LOGIN_MUTATION,
      {
        variables: {
          input: {email, password},
        },
      },
    );

    if (!customerAccessTokenCreate?.customerAccessToken?.accessToken) {
      throw new Error(customerAccessTokenCreate?.customerUserErrors[0].message);
    }

    const {customerAccessToken} = customerAccessTokenCreate;
    session.set('customerAccessToken', customerAccessToken);

    return redirect('/account', {
      headers: {
        'Set-Cookie': await session.commit(),
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return json({error: error.message}, {status: 400});
    }
    return json({error}, {status: 400});
  }
}

async function refreshToken(
  session,
  customerAccountId,
  origin,
) {
  const body = new URLSearchParams();
  const userAgent =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.93 Safari/537.36';
console.log('session', session)
  body.append('grant_type', 'refresh_token');
  body.append('refresh_token', session.get('refresh_token'));
  body.append('client_id', customerAccountId);

  const headers = {
    'content-type': 'application/x-www-form-urlencoded',
    'User-Agent': userAgent,
    Origin: origin,
  };

  const response = await fetch("https://shopify.com/68829970454/auth/oauth/token", {
    method: 'POST',
    headers,
    body: body,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Response(text, {
      status: response.status,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  }

  const {access_token, expires_in, id_token, refresh_token} =
  await response.json();

  session.set('customer_authorization_code_token', access_token);
  // Store the date in future the token expires, separated by two minutes
  session.set(
    'expires_at',
    new Date(new Date().getTime() + (expires_in - 120) * 1000).getTime(),
  );

  session.set('id_token', id_token);
  session.set('refresh_token', refresh_token);

  const customerAccessToken = await exchangeAccessToken(
    session,
    customerAccountId,
    origin,
  );
  session.set('customer_access_token', customerAccessToken);
}

async function isLoggedIn(
  request,
  session,
  clientId,
) {
  if (!session?.get('customer_access_token')) return false;

  const origin = new URL(request.url).origin

  if (session.get('expires_at') < new Date().getTime()) {
    try {
      await refreshToken(
        session,
        clientId,
        origin,
      );

      return true;
    } catch (error) {
      if (error && error.status !== 401) {
        throw error;
      }
    }
  } else {
    return true;
  }

  session.unset('code-verifier');
  session.unset('customer_authorization_code_token');
  session.unset('expires_at');
  session.unset('id_token');
  session.unset('refresh_token');
  session.unset('customer_access_token');

  return false;
}


async function exchangeAccessToken(
  session,
  customerAccountId,
  origin,
) {
  const clientId = customerAccountId;
  const customerApiClientId = '30243aa5-17c1-465a-8493-944bcc4e88aa';
  const accessToken = session.get('customer_authorization_code_token');
  const body = new URLSearchParams();

  body.append('grant_type', 'urn:ietf:params:oauth:grant-type:token-exchange');
  body.append('client_id', clientId);
  body.append('audience', customerApiClientId);
  body.append('subject_token', accessToken);
  body.append(
    'subject_token_type',
    'urn:ietf:params:oauth:token-type:access_token',
  );
  body.append('scopes', 'https://api.customers.com/auth/customer.graphql');

  const userAgent =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.93 Safari/537.36';

  const headers = {
    'content-type': 'application/x-www-form-urlencoded',
    'User-Agent': userAgent,
    Origin: origin,
  };

  // Token Endpoint goes here
  const response = await fetch("https://shopify.com/68829970454/auth/oauth/token", {
    method: 'POST',
    headers,
    body,
  });


  const data = await response.json();
  if (data.error) {
    throw new Response(data.error_description, {status: 400});
  }
  return data.access_token;
}


export default function Login() {
  const data = useActionData();
  const {user} = useLoaderData();
  const error = data?.error || null;

  return (

    <div>
      {user ? (
        <>
          <div>
            <b>
              <span>{data.accessToken}</span>
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

