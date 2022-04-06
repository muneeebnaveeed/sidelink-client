import React from 'react'
import ProductForm from '../ProductForm';

const EditSupplier = props => {
	return (
		<ProductForm mode="EDIT" param={props.match.params} />


	)
}


export default EditSupplier
