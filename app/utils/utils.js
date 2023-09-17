import {useLocation, useMatches} from '@remix-run/react';
import {useMemo} from 'react';

export function useVariantUrl(handle, selectedOptions) {
  const {pathname} = useLocation();

  return useMemo(() => {
    return getVariantUrl({
      handle,
      pathname,
      searchParams: new URLSearchParams(),
      selectedOptions,
    });
  }, [handle, selectedOptions, pathname]);
}

export function getVariantUrl({
  handle,
  pathname,
  searchParams,
  selectedOptions,
}) {
  const match = /(\/[a-zA-Z]{2}-[a-zA-Z]{2}\/)/g.exec(pathname);
  const isLocalePathname = match && match.length > 0;

  const path = isLocalePathname
    ? `${match[0]}products/${handle}`
    : `/products/${handle}`;

  selectedOptions.forEach((option) => {
    searchParams.set(option.name, option.value);
  });

  const searchString = searchParams.toString();

  return path + (searchString ? '?' + searchParams.toString() : '');
}

// export function usePageAnalytics() {
//   const matches = useMatches();

//   const analyticsFromMatches = useMemo(() => {
//     const data = {};

//     matches.forEach((event) => {
//       const eventData = event?.data;
//       if (eventData) {
//         eventData['analytics'] && Object.assign(data, eventData['analytics']);
//       }
//     });

//     return data;
//   }, [matches]);

//   return analyticsFromMatches;
// }



// import {DEFAULT_LOCALE} from '~/lib/utils';

export function usePageAnalytics({hasUserConsent}) {
  const matches = useMatches();

  return useMemo(() => {
    const data = {};

    matches.forEach((event) => {
      const eventData = event?.data;
      if (eventData) {
        eventData['analytics'] && Object.assign(data, eventData['analytics']);

        const selectedLocale = eventData['selectedLocale'] || 'en-US';
        Object.assign(data, {
          currency: selectedLocale.currency,
          acceptedLanguage: selectedLocale.language,
        });
      }
    });

    return {
      ...data,
      hasUserConsent,
    };
  }, [matches]);
}
