import React from 'react';
import { Route, Switch } from 'react-router-dom';
import ProductList from './product-list/ProductList';
import ManageProduct from './manage-product/ManageProduct';

const Products = (props) => {
	const { match } = props;
	return (
		<Switch>
			<Route path={`${match.url}/`} exact component={ProductList} />
			<Route path={`${match.url}/manage`} exact component={ManageProduct} />
		</Switch>
	);
};

export default Products;
