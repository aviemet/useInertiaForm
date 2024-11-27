import { useState } from "react";
import { useRemember } from "@inertiajs/react";

/**
 * Conditionally use useState or useRemember without violating the rule of hooks
 */
const useMaybeRemember = <T>(initialValue: T, rememberKey?: string): [T, React.Dispatch<React.SetStateAction<T>>] => {
	const [rememberedData, setRememberedData] = useRemember<T>(initialValue, rememberKey);
	const [localData, setLocalData] = useState<T>(initialValue);

	if(rememberKey) {
		return [rememberedData, setRememberedData];
	}
	return [localData, setLocalData];
};

export { useMaybeRemember }
