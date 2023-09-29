import {json, redirect} from '@shopify/remix-oxygen';

export const meta = () => {
  return [{title: 'Logout'}];
};

// export async function loader() {
//   return redirect('/account/login');
// }

export async function action({request, context}) {
  // const {session} = context;
  const id_token = context.session.get('id_token');
  context.session.unset('customer_access_token');
  context.session.unset('customer_authorization_code_token');
  context.session.unset('expires_in');
  context.session.unset('id_token');
  context.session.unset('refresh_token');

  if (request.method !== 'POST') {
    return json({error: 'Method not allowed'}, {status: 405});
  }

  return redirect(`https://shopify.com/68829970454/auth/logout?id_token_hint=${id_token}`, {
    status: 302,
    headers: {
      'Set-Cookie': await context.session.commit(),
    },
  });
}

// export default function Logout() {
//   return null;
// }
