import React from 'react';
import { motion } from 'framer-motion';

const wrapperVariants = {
	initial: { opacity: 0, x: -100 },
	animate: { opacity: 1, x: 0, transition: { duration: 0.2 } },
	exit: { opacity: 0, x: 100, transition: { duration: 0.1 } },
};

const AnimatedWrapper = ({ children }) => {
	return <div>{children}</div>;
	// return (
	// 	<motion.div variants={wrapperVariants} initial="initial" animate="animate" exit="exit">
	// 		{children}
	// 	</motion.div>
	// );
};

export default AnimatedWrapper;
