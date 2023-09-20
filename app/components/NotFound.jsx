import {Link} from '@remix-run/react';
import Button from '~/components/Button';

export default function NotFound() {
  return (
    <div className="min-h-[63vh] flex items-center justify-center">
      <div className="text-center">
        <h2 className="relative h1 mb-7">404</h2>
        <p className="text-center mb-4 max-w-[24ch] text-h5 mx-auto">
          Page not found
        </p>
        <p className="text-center mb-8 max-w-[30ch]">
          Sorry, the page you’re looking for doesn’t exist or has been removed.
        </p>
        <Button>
          <Link to="/">Back to Home</Link>
        </Button>
      </div>
    </div>
  );
}
