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

const TRANSACTIONS_DATA = [
	{
		supplier: {
			name: 'Genevieve Williams',
		},
		paid: 3851,
		type: 'SALE',
		discount: 60,
		subtotal: 2090,
		total: 2603,
		products: [
			{
				productVariant: {
					_id: '626e4ab17b9b2d3282070b60',
					name: 'Bowman Benjamin',
				},
				quantity: 5,
				total: 95,
			},
		],
	},
	{
		supplier: {
			name: 'Avery Leach',
		},
		paid: 2749,
		type: 'SALE',
		discount: 39,
		subtotal: 1621,
		total: 3223,
		products: [
			{
				productVariant: {
					_id: '626e4ab15ece38c82de97a5f',
					name: 'Joyce Riley',
				},
				quantity: 75,
				total: 11,
			},
		],
	},
	{
		supplier: {
			name: 'Jensen Rojas',
		},
		paid: 3517,
		type: 'SALE',
		discount: 83,
		subtotal: 1117,
		total: 2765,
		products: [
			{
				productVariant: {
					_id: '626e4ab1df2ab5d411bee663',
					name: 'Kristine Wilkerson',
				},
				quantity: 56,
				total: 94,
			},
		],
	},
];

const PRODUCT_VARIANT_DATA = [
	{
		productVariant: {
			_id: '626e4ab17b9b2d3282070b60',
			name: 'Bowman Benjamin',
			sku: '123123132',
			price: 200,
			product: {
				_id: '626e4ab17b9b2d3282070b60',
				name: 'Knorr Noodles',
			},
		},
		quantity: 5,
		total: 95,
	},
	{
		productVariant: {
			_id: '626e4ab17b9b2d3282070b60',
			name: 'Bowman Benjamin',
			sku: '123123132',
			price: 200,
			product: {
				_id: '626e4ab17b9b2d3282070b60',
				name: 'Knorr Noodles',
			},
		},
		quantity: 5,
		total: 95,
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
	STOCK: generatePlaceholderData(PRODUCTS_DATA),
	TRANSACTIONS: generatePlaceholderData(TRANSACTIONS_DATA),
	PRODUCT_VARIANTS: PRODUCT_VARIANT_DATA,
};

export default PLACEHOLDER_DATA;
