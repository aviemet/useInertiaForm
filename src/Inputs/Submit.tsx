import React from 'react'
import { useForm } from '../Form'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	component?: string | React.ComponentType
}

const Submit = React.forwardRef<HTMLButtonElement, ButtonProps>((
	{ children, type = 'submit', disabled, component = 'button', ...props },
	ref,
) => {
	const { processing } = useForm()

	const Element = component

	return (
		<Element { ...{ children, type, disabled: disabled || processing, ref, ...props } } />
	)
})

export default Submit
