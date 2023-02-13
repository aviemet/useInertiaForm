import React, { useEffect } from 'react'
import { createContext } from './utils'
import { useFormMeta } from './Form'

export interface NestedFieldsProps {
	children: React.ReactNode
	model: string
}

const [useNestedAttribute, NestedAttributeProvider] = createContext<string>()
export { useNestedAttribute }

const NestedFields = ({ children, model }: NestedFieldsProps) => {
	let inputModel = model

	try {
		const nested = useNestedAttribute()
		inputModel = `${nested}.${model}`
	} catch (e) {}

	const { addAttribute } = useFormMeta()

	useEffect(() => {
		addAttribute(model)
	}, [])

	return (
		<NestedAttributeProvider value={ inputModel }>
			{ children }
		</NestedAttributeProvider>
	)
}

export default NestedFields
