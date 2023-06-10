import React, { useCallback } from 'react'
import { useForm } from '../Form'
import { isEmpty } from 'lodash'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	component?: string | React.ComponentType
	requiredFields?: string[]
}

const Submit = React.forwardRef<HTMLButtonElement, ButtonProps>((
	{ children, type = 'submit', disabled = false, component:Component = 'button', requiredFields, ...props },
	ref,
) => {
	const { data, getData, processing } = useForm()

	const hasEmptyRequiredFields = useCallback(() => {
		if(!requiredFields || requiredFields.length === 0) return false

		return requiredFields.some((field) => isEmpty(getData(field)))
	}, [data])

	return (
		<Component { ...{
			children,
			type,
			disabled: disabled || processing || (requiredFields && hasEmptyRequiredFields()),
			ref,
			...props,
		} } />
	)
})

export default React.memo(Submit)
