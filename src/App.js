import React from 'react';
import { Provider } from 'react-redux';
import store from './redux/store';
import Views from './views';
import { Route, Switch, useLocation } from 'react-router-dom';
import { ThemeSwitcherProvider } from 'react-css-theme-switcher';
import { THEME_CONFIG } from './configs/AppConfig';
import { QueryClientProvider, QueryClient } from 'react-query';
import 'dotenv/config';
import { AnimatePresence } from 'framer-motion';

const themes = {
	dark: `${process.env.PUBLIC_URL}/css/dark-theme.css`,
	light: `${process.env.PUBLIC_URL}/css/light-theme.css`,
};

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 60 * 1000,
			retry: false,
			keepPreviousData: true,
		},
	},
});

function App() {
	return (
		<div className="App">
			<QueryClientProvider client={queryClient}>
				<Provider store={store}>
					<ThemeSwitcherProvider
						themeMap={themes}
						defaultTheme={THEME_CONFIG.currentTheme}
						insertionPoint="styles-insertion-point"
					>
						<Switch>
							<Route path="/" component={Views} />
						</Switch>
					</ThemeSwitcherProvider>
				</Provider>
			</QueryClientProvider>
		</div>
	);
}

export default App;
