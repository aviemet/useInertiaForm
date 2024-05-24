import React from 'react'
import useInertiaInput from '../useInertiaInput'
import { NestedObject } from '../useInertiaForm'
import { BaseFormInputProps, InputConflicts } from '.'

interface InputProps<TForm extends NestedObject, T = string>
	extends
	Omit<React.InputHTMLAttributes<HTMLInputElement>, InputConflicts>,
	BaseFormInputProps<T, TForm>
{
	component?: React.ElementType
}

const Input = <TForm extends NestedObject, T = string>(
	{ name,
		component = 'input',
		type = 'text',
		model,
		onChange,
		errorKey,
		defaultValue,
		clearErrorsOnChange,
		...props
	}: InputProps<TForm, T>,
) => {
	const { form, inputName, inputId, value, setValue } = useInertiaInput<T, TForm>({
		name,
		model,
		errorKey,
		defaultValue,
		clearErrorsOnChange,
	})
	// console.log({ name, model, errorKey, defaultValue, inputName, inputId, value })
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = (e.target?.checked || e.target.value) as T
		setValue(value)
		onChange?.(value, form)
	}

	const Element = component

	return (
		<Element
			type={ type }
			name={ inputName }
			id={ inputId }
			value={ value }
			onChange={ handleChange }
			{ ...props }
		/>
	)
}

export default Input
