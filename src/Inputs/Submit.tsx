import React from 'react'
import useInertiaForm from '../useInertiaForm'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	component?: string | React.ComponentType
}

const Submit = React.forwardRef<HTMLButtonElement, ButtonProps>((
	{ children, type = 'submit', disabled, component = 'button', ...props },
	ref,
) => {
	const { processing } = useInertiaForm()

	const Element = component

	return (
		<Element { ...{ children, type, disabled: disabled || processing, ref, ...props } } />
	)
})

export default Submit
