export default function LoginButton() {
    return (
      <div>
        <Form method="post" action="/authorize">
          <button>Login</button>
        </Form>
      </div>
    );
  };

