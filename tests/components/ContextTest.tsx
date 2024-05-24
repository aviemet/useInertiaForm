import React, { useEffect } from 'react'
import { NestedObject, useForm, UseFormProps } from '../../src'
import CircularJSON from 'circular-json'

const safeStringify = (obj) => {
	try {
		return CircularJSON.stringify(obj)
	} catch(err) {
		console.error('Error stringifying object:', err)
		return null
	}
}

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
				{ safeStringify(form.data) }
			</div>
			<div data-testid="errors">
				{ safeStringify(form.errors) }
			</div>
		</>
	)

}

export default ContextTest
