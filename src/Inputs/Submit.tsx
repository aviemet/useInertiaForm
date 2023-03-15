import React from 'react'
import { useForm } from '../Form'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	component?: string | JSX.Element
}

const Submit = React.forwardRef<HTMLButtonElement, ButtonProps>((
	{ children, type = 'submit', disabled, component = 'button', ...props },
	ref,
) => {
	const { processing } = useForm()

	const finalProps = { children, type, disabled: disabled || processing, ref, ...props }

	if(typeof component === 'string') {
		return React.createElement(component, finalProps)
	}

	return React.cloneElement(component, finalProps)
})

export default Submit
