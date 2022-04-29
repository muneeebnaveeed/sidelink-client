import { Button, Col, Form, Input, InputNumber, Row } from 'antd';
import { Flex } from 'components/shared-components';
import React, { useCallback, useMemo } from 'react';
import { DeleteOutlined } from '@ant-design/icons';
import Utils from 'utils';

const VariantRow = ({
	name,
	price,
	sku,
	variants,
	variantErrors,
	index,
	setFieldValue,
	setFieldError,
	productName,
}) => {
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

			if (key === 'name') {
				const sku = Utils.generateSKU(productName, value, index);
				if (sku) updatedVariants[index].sku = sku;
			}

			updatedVariants[index][key] = value;
			setFieldValue('variants', updatedVariants);
		},
		[productName, setFieldValue, variants]
	);

	const handleChangeCustomVariant = useCallback(
		(value, key, index) => {
			const updatedVariants = [...variants];
			updatedVariants[index][key] = value;
			setFieldValue('variants', updatedVariants);
		},
		[setFieldValue, variants]
	);

	const handleRemoveVariant = useCallback(
		(index) => () => {
			const updatedVariants = [...variants];
			const errors = [...(typeof variantErrors === 'object' ? [] : variantErrors)];
			errors.splice(index, 1);
			updatedVariants.splice(index, 1);
			setFieldError('variants', errors);
			setFieldValue('variants', updatedVariants);
		},
		[setFieldError, setFieldValue, variantErrors, variants]
	);

	return (
		<Row gutter={16}>
			<Col sm={24} xl={12}>
				<Form.Item
					required
					label="Variant name"
					validateStatus={getVariantValidationStatus('name', index)}
					help={getVariantValidationError('name', index)}
					className="product-variant-form-item"
				>
					<Input size="small" value={name} onChange={handleChangeVariant('name', index)} />
				</Form.Item>
			</Col>
			<Col sm={24} md={11} xl={showDeleteButton ? 5 : 6}>
				<Form.Item
					required
					label="Price"
					validateStatus={getVariantValidationStatus('price', index)}
					help={getVariantValidationError('price', index)}
					className="product-variant-form-item"
				>
					<InputNumber
						size="small"
						className="w-100"
						value={price}
						formatter={(value) => value.replace(/(\d+?)(?=(\d\d)+(\d)(?!\d))(\.\d+)?/g, '$1,')}
						parser={(value) => {
							const parsedValue = value.replace(/\$\s?|(,*)/g, '');
							handleChangeCustomVariant(parsedValue, 'price', index);
							return parsedValue;
						}}
					/>
				</Form.Item>
			</Col>
			<Col sm={22} md={11} xl={showDeleteButton ? 5 : 6}>
				<Form.Item
					required
					label="SKU"
					validateStatus={getVariantValidationStatus('sku', index)}
					help={getVariantValidationError('sku', index)}
					className="product-variant-form-item"
				>
					<Input size="small" value={sku} onChange={handleChangeVariant('sku', index)} />
				</Form.Item>
			</Col>
			{!!showDeleteButton && (
				<Col sm={2}>
					<Flex justifyContent="center" className="w-100 h-100">
						<Button
							size="small"
							type="danger"
							shape="circle"
							className="delete-form-list-item-button"
							icon={<DeleteOutlined />}
							onClick={handleRemoveVariant(index)}
						/>
					</Flex>
				</Col>
			)}
		</Row>
	);
};

export default VariantRow;
