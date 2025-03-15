import React, { useReducer } from "react"
import { createContext } from "../utils"

/**
 * Form Meta Context
 */
export type FormMetaValue = {
	nestedAttributes: Set<string>
	addAttribute: (attribute: string) => void
	model?: string
	railsAttributes: boolean
}

const [useFormMeta, FormMetaProvider] = createContext<FormMetaValue>()
export { useFormMeta }

const attributesReducer = (state: Set<string>, attribute: string) => {
	const newState = new Set(state)
	newState.add(attribute)
	return newState
}

/**
 * Form Meta Wrapper Component
 */
interface FormMetaWrapperProps {
	children: React.ReactNode
	model?: string
	railsAttributes: boolean
}

const FormMetaWrapper = ({ children, model, railsAttributes }: FormMetaWrapperProps) => {
	const [nestedAttributes, addAttribute] = useReducer(attributesReducer, new Set<string>())
	const metaValues: FormMetaValue = {
		nestedAttributes,
		addAttribute,
		model,
		railsAttributes,
	}

	return (
		<FormMetaProvider value={ metaValues }>
			{ children }
		</FormMetaProvider>
	)
}

export default FormMetaWrapper
