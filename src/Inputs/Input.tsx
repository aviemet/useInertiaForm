import React from 'react'
import useInertiaInput from '../useInertiaInput'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	name: string
	model?: string
	component?: React.ElementType
}

const Input = React.forwardRef<HTMLInputElement, InputProps>((
	{ name, component = 'input', model, onChange, ...props },
	ref,
) => {
	const { inputName, inputId, value, setValue } = useInertiaInput({ name, model })

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if(onChange) {
			onChange(e)
			return
		}

		setValue(e.target.value)
	}

	const Element = component

	return (
		<Element
			name={ inputName }
			id={ inputId }
			value={ value }
			onChange={ handleChange }
			ref={ ref }
			{ ...props }
		/>
	)
})

export default Input
