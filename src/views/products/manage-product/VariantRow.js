import { Button, Col, Form, Input, InputNumber, Row, Space } from 'antd';
import { Flex } from 'components/shared-components';
import React, { useCallback, useMemo } from 'react';
import { CloseOutlined } from '@ant-design/icons';
import Utils from 'utils';
import { cloneDeep } from 'lodash';

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
	const canDelete = useMemo(() => variants.length > 1, [variants.length]);

	const getVariantValidationError = useCallback((key, index) => variantErrors?.[index]?.[key] || null, [variantErrors]);

	const getVariantValidationStatus = useCallback(
		(key, index) => (variantErrors?.[index]?.[key] ? 'error' : null),
		[variantErrors]
	);

	const handleChangeVariant = useCallback(
		(key, index) => (event) => {
			const value = event.target.value;
			const updatedVariants = cloneDeep(variants);

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
			const updatedVariants = cloneDeep(variants);
			updatedVariants[index][key] = value;
			setFieldValue('variants', updatedVariants);
		},
		[setFieldValue, variants]
	);

	const handleRemoveVariant = useCallback(
		(index) => () => {
			const updatedVariants = cloneDeep(variants);
			const errors = [
				...(typeof variantErrors === 'object' || variantErrors === undefined || variantErrors === null
					? []
					: variantErrors),
			];
			errors.splice(index, 1);
			updatedVariants.splice(index, 1);
			setFieldError('variants', errors);
			setFieldValue('variants', updatedVariants);
		},
		[setFieldError, setFieldValue, variantErrors, variants]
	);

	const handleAddVariant = useCallback(() => {
		const $variants = cloneDeep(variants);
		$variants.push({ name: '', price: '', sku: '' });
		setFieldValue('variants', $variants);
	}, [setFieldValue, variants]);

	return (
		<Row gutter={16}>
			<Col>
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
			<Col>
				<Form.Item
					required
					label="Price"
					validateStatus={getVariantValidationStatus('price', index)}
					help={getVariantValidationError('price', index)}
					className="product-variant-form-item"
				>
					<InputNumber
						size="small"
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
			<Col>
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
			<Col style={{ flex: 1 }}>
				<Flex className="h-100" justifyContent="end" alignItems="center">
					<Space>
						<Button
							type="link"
							disabled={index < variants.length - 1 || !name || !price || !sku}
							onClick={handleAddVariant}
						>
							Add Variant
						</Button>
						<Button type="link" disabled={!canDelete} onClick={handleRemoveVariant(index)}>
							<CloseOutlined />
						</Button>
					</Space>
				</Flex>
			</Col>
		</Row>
	);
};

export default VariantRow;
