const PRODUCTS_DATA = [
	{
		product: {
			name: 'Lucinda Cannon',
		},
		variants: [
			{
				name: 'Lucinda Cannon',
				price: 10401,
				sku: 'velit',
			},
		],
	},
	{
		product: {
			name: 'Lucinda Cannon',
		},
		variants: [
			{
				name: 'Lucinda Cannon',
				price: 10401,
				sku: 'velit',
			},
		],
	},
	{
		product: {
			name: 'Lucinda Cannon',
		},
		variants: [
			{
				name: 'Lucinda Cannon',
				price: 10401,
				sku: 'velit',
			},
		],
	},
];

const SUPPLIERS_DATA = [
	{
		name: 'Saundra Lynch',
		phone: '+1 (838) 500-3795',
	},
	{
		name: 'Jeannine Hudson',
		phone: '+1 (827) 408-3449',
	},
	{
		name: 'Jordan Fox',
		phone: '+1 (958) 548-3122',
	},
	{
		name: 'Stella Bell',
		phone: '+1 (882) 536-3184',
	},
];

const generatePlaceholderData = (data) => {
	return {
		docs: data,
		pagingCounter: 1,
		hasNextPage: false,
		page: 1,
		limit: 10,
	};
};

const PLACEHOLDER_DATA = {
	PRODUCTS: generatePlaceholderData(PRODUCTS_DATA),
	SUPPLIERS: generatePlaceholderData(SUPPLIERS_DATA),
	CUSTOMERS: generatePlaceholderData(SUPPLIERS_DATA),
};

export default PLACEHOLDER_DATA;
