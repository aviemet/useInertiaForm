import React, { useEffect } from 'react'
import { createContext } from '../utils'
import { useFormMeta } from '../Form'

export interface NestedFieldsProps {
	children: React.ReactNode | React.ReactElement[]
	model: string
}

const [useNestedAttribute, NestedAttributeProvider] = createContext<string>()
export { useNestedAttribute }

const NestedFields = ({ children, model }: NestedFieldsProps) => {
	let inputModel = model

	try {
		const nested = useNestedAttribute()

		if(model.charAt(0) === '[') {
			inputModel = `${nested}${model}`
		} else {
			inputModel = `${nested}.${model}`
		}
	} catch(e) {}

	const { addAttribute } = useFormMeta()

	useEffect(() => {
		addAttribute(model)
	}, [])

	return (
		<NestedAttributeProvider value={ inputModel }>
			{ Array.isArray(children) ? children.map((child, i) => React.cloneElement(child, { key: i })) : children }
		</NestedAttributeProvider>
	)
}

export default NestedFields
