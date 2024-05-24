import React, { useEffect } from 'react'
import { NestedObject, useForm, UseFormProps } from '../../src'

interface ContextTestProps<T = NestedObject> {
	cb?: (form: UseFormProps<T>) => void
}

const ContextTest = <T = NestedObject>({ cb }: ContextTestProps<T>) => {
	const form = useForm<T>()

	useEffect(() => {
		cb?.(form)
	}, [cb])

	return (
		<>
			<div data-testid="data">
				{ JSON.stringify(form.data) }
			</div>
			<div data-testid="errors">
				{ JSON.stringify(form.errors) }
			</div>
		</>
	)

}

export default ContextTest
