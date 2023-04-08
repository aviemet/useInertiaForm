import React from 'react'
import useInertiaInput from '../useInertiaInput'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	name: string
	model?: string
	component?: React.ElementType
}

const Input = React.forwardRef<HTMLInputElement, InputProps>((
	{ name, component = 'input', model, ...props },
	ref,
) => {
	const { inputName, inputId, value, setValue } = useInertiaInput({ name, model })

	const Element = component

	return (
		<Element
			name={ inputName }
			id={ inputId }
			value={ value }
			onChange={ (e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value) }
			ref={ ref }
			{ ...props }
		/>
	)
})

export default Input
