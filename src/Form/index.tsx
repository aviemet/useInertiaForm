import React from 'react'
import Form from './Form'
import { useForm, type UseFormProps, type HTTPVerb } from './FormProvider'
import FormMetaWrapper, { useFormMeta, type FormMetaValue } from './FormMetaWrapper'
import { NestedObject } from '../useInertiaForm'

type PartialTMLForm = Omit<React.FormHTMLAttributes<HTMLFormElement>, 'onChange'|'onSubmit'|'onError'>

export interface FormProps<TForm> extends PartialTMLForm {
	data: TForm
	model?: string
	method?: HTTPVerb
	to?: string
	async?: boolean
	remember?: boolean
	railsAttributes?: boolean
	onSubmit?: (form: UseFormProps<TForm>) => boolean|void
	onChange?: (form: UseFormProps<TForm>) => void
	onSuccess?: (form: UseFormProps<TForm>) => void
	onError?: (form: UseFormProps<TForm>) => void
}

const WrappedForm = <TForm extends NestedObject>(
	{ children, model, railsAttributes = false, ...props }: FormProps<TForm>,
) => {
	return (
		<FormMetaWrapper model={ model } railsAttributes={ railsAttributes }>
			<Form<TForm> model={ model } { ...props }>
				{ children }
			</Form>
		</FormMetaWrapper>
	)
}

export {
	WrappedForm as Form,
	useForm,
	useFormMeta,
	type HTTPVerb,
	type UseFormProps,
	type FormMetaValue,
}
