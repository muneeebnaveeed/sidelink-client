import { Button, Col, Form, Input, InputNumber, Row } from 'antd';
import { Flex } from 'components/shared-components';
import React, { useCallback, useMemo } from 'react';
import { DeleteOutlined } from '@ant-design/icons';
import Utils from 'utils';

const VariantRow = ({ name, price, sku, variants, quantity, variantErrors, index, setFieldValue }) => {
	const showDeleteButton = useMemo(() => variants.length > 1, [variants.length]);

	const getVariantValidationError = useCallback((key, index) => variantErrors?.[index]?.[key] || null, [variantErrors]);

	const getVariantValidationStatus = useCallback(
		(key, index) => (variantErrors?.[index]?.[key] ? 'error' : null),
		[variantErrors]
	);

	const handleChangeVariant = useCallback(
		(key, index) => (event) => {
			const value = event.target.value;
			const updatedVariants = [...variants];

			updatedVariants[index][key] = value;
			setFieldValue('variants', updatedVariants);
		},
		[setFieldValue, variants]
	);

	return (
		<Row gutter={16}>
			<Col sm={24} md={12} xl={6}>
				<Form.Item label="Variant" className="product-variant-form-item">
					<Input size="small" value={name} disabled />
				</Form.Item>
			</Col>
			<Col sm={24} md={12} xl={6}>
				<Form.Item label="Price" className="product-variant-form-item">
					<InputNumber
						size="small"
						className="w-100"
						value={price}
						disabled
						formatter={(value) => value.replace(/(\d+?)(?=(\d\d)+(\d)(?!\d))(\.\d+)?/g, '$1,')}
						parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
					/>
				</Form.Item>
			</Col>
			<Col sm={24} md={12} xl={6}>
				<Form.Item label="SKU" className="product-variant-form-item">
					<Input size="small" value={sku} disabled />
				</Form.Item>
			</Col>
			<Col sm={24} md={12} xl={6}>
				<Form.Item
					required
					label="Qty."
					validateStatus={getVariantValidationStatus('quantity', index)}
					help={getVariantValidationError('quantity', index)}
					className="product-variant-form-item"
				>
					<Input size="small" value={quantity} onChange={handleChangeVariant('quantity', index)} />
				</Form.Item>
			</Col>
		</Row>
	);
};

export default VariantRow;
