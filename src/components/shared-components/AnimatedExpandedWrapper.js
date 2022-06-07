import React from 'react';
import { motion } from 'framer-motion';

const AnimatedExpandedWrapper = ({ isExpanded = false, children }) => {
	return (
		<motion.div animate={{ height: isExpanded ? 'auto' : 0 }} transition={{ duration: 0.2 }}>
			{children}
		</motion.div>
	);
};

export default AnimatedExpandedWrapper;
