import React from 'react'
import { useInertiaInput } from '../src'

interface TestInputProps {
	name: string
	model?: string
	clearErrorsOnChange?: boolean
}

const TestInput = ({ name, model, clearErrorsOnChange = true }: TestInputProps) => {
	const { inputName, inputId, value, setValue } = useInertiaInput<string>({
		name,
		model,
		clearErrorsOnChange,
	})

	return (
		<input
			type="text"
			role="input"
			name={ inputName }
			id={ inputId }
			value={ value }
			onChange={ e => setValue(e.target.value) }
		/>
	)
}

export default TestInput
