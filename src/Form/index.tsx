import React, { forwardRef } from 'react'
import FormComponent, {
	useForm,
	type HTTPVerb,
	type UseFormProps,
	type FormComponentProps,
} from './Form'
import FormMetaWrapper, { useFormMeta, type FormMetaValue } from './FormMetaWrapper'
import { NestedObject } from '../types'

const Form = forwardRef(<T extends Record<keyof T, NestedObject>>(
	{ model, railsAttributes = false, ...props }: FormComponentProps<T>,
	ref: React.ForwardedRef<HTMLFormElement>,
) => {
	return (
		<FormMetaWrapper model={ model } railsAttributes={ railsAttributes }>
			<FormComponent model={ model } railsAttributes={ railsAttributes } ref={ ref } { ...props }/>
		</FormMetaWrapper>
	)
})

export {
	Form,
	useForm,
	useFormMeta,
	type HTTPVerb,
	type UseFormProps,
	type FormComponentProps,
	type FormMetaValue,
}
