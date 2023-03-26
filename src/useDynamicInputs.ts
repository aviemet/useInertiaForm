import { useCallback } from 'react'
import { useForm, useFormMeta } from './Form'
import { get, set } from 'lodash'
import { useNestedAttribute } from './NestedFields'
import { NestedObject } from './useInertiaForm'

export interface DynamicInputsProps {
	model?: string
	emptyData: Record<string, unknown>
}

type DynamicInputsReturn = {
	addInput: () => void
	removeInput: (i: number) => void
	paths: string[]
}

const useDynamicInputs = ({ model, emptyData }: DynamicInputsProps): DynamicInputsReturn => {
	const { setData, unsetData, getData } = useForm()
	const { model: formModel } = useFormMeta()
	let inputModel = formModel ?? ''

	try {
		const nestedModel = useNestedAttribute()
		inputModel = formModel ? `${inputModel}.${nestedModel}` : nestedModel
	} catch(e) {}

	inputModel = `${inputModel}.${model || ''}`

	const handleAddInputs = useCallback(() => {
		setData((formData: NestedObject) => {
			const clone = structuredClone(formData)
			let node: unknown[] = get(clone, inputModel) as unknown[]

			if(!node || !Array.isArray(node)) {
				set(clone, inputModel, [])
				node = get(clone, inputModel) as unknown[]
			}

			node.push(emptyData)
			set(clone, inputModel, node)

			return clone
		})
	}, [])

	const handleRemoveInputs = useCallback((i: number) => {
		unsetData(`${inputModel}[${i}]`)
	}, [])

	const data = getData(inputModel)

	const generatePaths = useCallback(() => {
		if(!Array.isArray(data)) return []

		return data.map((_,i) => `${model || ''}[${i}]`)
	}, [data])

	return {
		addInput: handleAddInputs,
		removeInput: handleRemoveInputs,
		paths: generatePaths(),
	}
}

export default useDynamicInputs
