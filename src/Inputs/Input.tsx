import React from 'react'
import useInertiaInput from '../useInertiaInput'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	name: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>((
	{ name, ...props },
	ref,
) => {
	const { inputName, inputId, value, setValue } = useInertiaInput({ name })

	return (
		<input
			name={ inputName }
			id={ inputId }
			value={ value }
			onChange={ e => setValue(e.target.value) }
			ref={ ref }
			{ ...props }
		/>
	)
})

export default Input
