import React, { lazy, Suspense } from 'react';
import { Switch, Route, Redirect, useLocation } from 'react-router-dom';
import Loading from 'components/shared-components/Loading';
import { APP_PREFIX_PATH } from 'configs/AppConfig';
import { AnimatePresence } from 'framer-motion';

export const AppViews = () => {
	const location = useLocation();
	return (
		<Suspense fallback={<Loading cover="content" />}>
			<AnimatePresence exitBeforeEnter>
				<Switch location={location} key={location.pathname}>
					<Route
						exact
						path={`${APP_PREFIX_PATH}/products`}
						component={lazy(() => import('../products/product-list/ProductList'))}
					/>
					<Route
						exact
						path={`${APP_PREFIX_PATH}/products/manage`}
						component={lazy(() => import('../products/manage-product/ManageProduct'))}
					/>

					<Route
						exact
						path={`${APP_PREFIX_PATH}/contacts`}
						component={lazy(() => import('../contacts/contact-list/ContactList'))}
					/>
					<Route
						exact
						path={`${APP_PREFIX_PATH}/contacts/suppliers/manage`}
						component={lazy(() => import('../contacts/manage-supplier/ManageSupplier'))}
					/>
					<Route
						exact
						path={`${APP_PREFIX_PATH}/contacts/customers/manage`}
						component={lazy(() => import('../contacts/manage-customer/ManageCustomer'))}
					/>

					<Route
						exact
						path={`${APP_PREFIX_PATH}/stock`}
						component={lazy(() => import('../stock/stock-list/StockList'))}
					/>
					<Route
						exact
						path={`${APP_PREFIX_PATH}/stock/manage`}
						component={lazy(() => import('../stock/manage-stock/ManageStock'))}
					/>

					<Route
						exact
						path={`${APP_PREFIX_PATH}/transactions`}
						component={lazy(() => import('../transactions/transaction-list/TransactionList'))}
					/>
					<Route
						exact
						path={`${APP_PREFIX_PATH}/transactions/purchases/manage`}
						component={lazy(() => import('../transactions/manage-purchase/ManagePurchase'))}
					/>

					<Route
						exact
						path={`${APP_PREFIX_PATH}/transactions/sales/manage`}
						component={lazy(() => import('../transactions/manage-sale/ManageSale'))}
					/>

					<Route
						exact
						path={`${APP_PREFIX_PATH}/employees`}
						component={lazy(() => import('../employees/employee-list/EmployeeList'))}
					/>
					<Route
						exact
						path={`${APP_PREFIX_PATH}/employees/manage`}
						component={lazy(() => import('../employees/manage-employee/ManageEmployee'))}
					/>

					{/* <Route path={`${APP_PREFIX_PATH}/employees`} component={lazy(() => import(`../employees`))} /> */}

					{/* <Route path={`${APP_PREFIX_PATH}/sales`} component={lazy(() => import(`../sales`))} /> */}

					{/* <Route path={`${APP_PREFIX_PATH}/dashboards`} component={lazy(() => import(`./dashboards`))} /> */}

					<Redirect from={`${APP_PREFIX_PATH}`} to={`${APP_PREFIX_PATH}/products`} />
				</Switch>
			</AnimatePresence>
		</Suspense>
	);
};

export default React.memo(AppViews);
