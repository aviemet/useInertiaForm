import { UseFormProps } from '../Form'
import { NestedObject } from '../useInertiaForm'
import { UseInertiaInputProps } from '../useInertiaInput'

export { default as Input } from './Input'
export { default as Submit } from './Submit'
export { default as NestedFields, type NestedFieldsProps } from './NestedFields'
export { default as DynamicInputs }  from './DynamicInputs'
export { default as useDynamicInputs, type DynamicInputsProps } from './useDynamicInputs'

export type InputConflicts = 'name'|'onChange'|'onBlur'|'onFocus'|'value'|'defaultValue'
export interface BaseFormInputProps<T, TForm extends NestedObject = NestedObject>
	extends UseInertiaInputProps<T>
{
	model?: string
	errorKey?: string
	field?: boolean
	required?: boolean
	hidden?: boolean
	onChange?: (value: T, form: UseFormProps<TForm>) => void
	onBlur?: (value: T, form: UseFormProps<TForm>) => void
	onFocus?: (value: T, form: UseFormProps<TForm>) => void
	wrapperProps?: Record<string, any>
}
