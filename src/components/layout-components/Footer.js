import React from 'react';
import { APP_NAME } from 'configs/AppConfig';

export default function Footer() {
	return (
		<footer className="footer">
			<span>
				Copyright &copy; {`${new Date().getFullYear()}`} <span className="font-weight-semibold">{`${APP_NAME}`}</span>{' '}
				All rights reserved.
			</span>
			<span>
				Software Developed by <span className="font-weight-semibold">Muneeb Naveed</span> - +92-308-5615517
			</span>
		</footer>
	);
}
