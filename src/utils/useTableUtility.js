import { useMemo, useState } from 'react';
import { useDebouncedValue } from 'rooks';

const useTableUtility = ({ page, limit } = { page: 1, limit: 10 }) => {
	const [p, setPage] = useState(page);
	const [l, setLimit] = useState(limit);
	const [sort, setSort] = useState({ undefined: -1 });
	const [search, setSearch] = useState('');
	const [debouncedSearch] = useDebouncedValue(search, 500);

	const value = useMemo(
		() => ({
			limit: {
				value: l,
				set: setLimit,
			},
			page: {
				value: p,
				set: setPage,
			},
			sort: {
				value: sort,
				set: setSort,
			},
			search: {
				debounced: debouncedSearch,
				value: search,
				set: setSearch,
			},
		}),
		[debouncedSearch, l, p, search, sort]
	);

	return value;
};

export default useTableUtility;
