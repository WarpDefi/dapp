import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import { AppDispatch } from '../../state';
import { ApplicationModal, setOpenModal } from '../../state/application/actions';

// Redirects to swap but only replace the pathname
export function RedirectPathToSwapOnly() {
  const location = useLocation();

  return <Navigate to={{ ...location, pathname: '/swap' }} />;
}

// Redirects from the /swap/:outputCurrency path to the /swap?outputCurrency=:outputCurrency format
export function RedirectToSwap() {
  const { outputCurrency } = useParams<{ outputCurrency: string }>();
  const location = useLocation();

  return (
    <Navigate
      to={{
        ...location,
        pathname: '/swap',
        search:
          location.search && location.search.length > 1
            ? `${location.search}&outputCurrency=${outputCurrency}`
            : `?outputCurrency=${outputCurrency}`,
      }}
    />
  );
}

export function OpenClaimAddressModalAndRedirectToSwap() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(setOpenModal(ApplicationModal.ADDRESS_CLAIM));
  }, [dispatch]);

  return <RedirectPathToSwapOnly />;
}
