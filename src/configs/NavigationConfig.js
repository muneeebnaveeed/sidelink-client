import {
	UserOutlined,
	LaptopOutlined,
	SnippetsOutlined,
	PicLeftOutlined,
	DashboardOutlined,
	AppstoreOutlined,
	FileTextOutlined,
	PieChartOutlined,
	EnvironmentOutlined,
	AntDesignOutlined,
	SafetyOutlined,
	StopOutlined,
	DotChartOutlined,
	MailOutlined,
	MessageOutlined,
	CalendarOutlined,
	BulbOutlined,
	InfoCircleOutlined,
	CompassOutlined,
	LayoutOutlined,
	DesktopOutlined,
	FileDoneOutlined,
	CommentOutlined,
	RobotOutlined,
	PlusCircleOutlined,
	FundOutlined,
	ShoppingCartOutlined,
	ShoppingOutlined,
	BookOutlined,
	FileUnknownOutlined,
	ProfileOutlined,
} from '@ant-design/icons';
import { APP_PREFIX_PATH } from 'configs/AppConfig';

const navigationConfig = [
	{
		key: 'dashboards',
		path: `${APP_PREFIX_PATH}/dashboards`,
		title: 'Menu',
		icon: DashboardOutlined,
		breadcrumb: false,
		submenu: [
			{
				key: 'products',
				path: `${APP_PREFIX_PATH}/products`,
				title: 'Products',
				icon: ShoppingCartOutlined,
				breadcrumb: true,
				submenu: [
					{
						key: 'manage-product',
						path: `${APP_PREFIX_PATH}/products/manage`,
						title: 'Add Product',
						icon: '',
						breadcrumb: false,
						submenu: [],
					},
					{
						key: 'product-list',
						path: `${APP_PREFIX_PATH}/products`,
						title: 'Product List',
						icon: '',
						breadcrumb: true,
						submenu: [],
					},
				],
			},

			{
				key: 'contacts',
				path: `${APP_PREFIX_PATH}/contacts`,
				title: 'Contacts',
				icon: ShoppingOutlined,
				breadcrumb: true,
				submenu: [
					{
						key: 'manage-supplier',
						path: `${APP_PREFIX_PATH}/contacts/suppliers/manage`,
						title: 'Add Supplier',
						icon: '',
						breadcrumb: false,
						submenu: [],
					},
					{
						key: 'manage-customer',
						path: `${APP_PREFIX_PATH}/contacts/customers/manage`,
						title: 'Add Customer',
						icon: '',
						breadcrumb: false,
						submenu: [],
					},
					{
						key: 'contacts-list',
						path: `${APP_PREFIX_PATH}/contacts`,
						title: 'Contacts List',
						icon: '',
						breadcrumb: true,
						submenu: [],
					},
				],
			},

			{
				key: 'stock',
				path: `${APP_PREFIX_PATH}/stock`,
				title: 'Stock',
				icon: ShoppingOutlined,
				breadcrumb: true,
				submenu: [
					{
						key: 'manage-stock',
						path: `${APP_PREFIX_PATH}/stock/manage`,
						title: 'Add Stock',
						icon: '',
						breadcrumb: false,
						submenu: [],
					},
					{
						key: 'stock-list',
						path: `${APP_PREFIX_PATH}/stock`,
						title: 'Stock List',
						icon: '',
						breadcrumb: true,
						submenu: [],
					},
				],
			},

			{
				key: 'transactions',
				path: `${APP_PREFIX_PATH}/transactions`,
				title: 'Transactions',
				icon: ShoppingOutlined,
				breadcrumb: true,
				submenu: [
					{
						key: 'manage-sale',
						path: `${APP_PREFIX_PATH}/transactions/sales/manage`,
						title: 'Make Sale',
						icon: '',
						breadcrumb: false,
						submenu: [],
					},
					{
						key: 'manage-purchase',
						path: `${APP_PREFIX_PATH}/transactions/purchases/manage`,
						title: 'Make Purchase',
						icon: '',
						breadcrumb: false,
						submenu: [],
					},
					{
						key: 'transaction-list',
						path: `${APP_PREFIX_PATH}/transactions`,
						title: 'Transaction List',
						icon: '',
						breadcrumb: true,
						submenu: [],
					},
				],
			},

			{
				key: 'employees',
				path: `${APP_PREFIX_PATH}/employees`,
				title: 'Employees',
				icon: UserOutlined,
				breadcrumb: true,
				submenu: [
					{
						key: 'manage-employee',
						path: `${APP_PREFIX_PATH}/employees/manage`,
						title: 'Add Employee',
						icon: '',
						breadcrumb: false,
						submenu: [],
					},
					{
						key: 'employee-list',
						path: `${APP_PREFIX_PATH}/employees`,
						title: 'Employee List',
						icon: '',
						breadcrumb: true,
						submenu: [],
					},
				],
			},
		],
	},
];

export default navigationConfig;
