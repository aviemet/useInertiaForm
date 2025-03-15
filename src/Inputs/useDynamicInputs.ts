import { useCallback } from "react"
import { useForm, useFormMeta } from "../Form"
import { get, set } from "lodash"
import { useNestedAttribute } from "./NestedFields"

export interface DynamicInputsProps<T = Record<string, unknown>> {
	model?: string
	emptyData: T
}

type AddInputHandler<T> = (override?: Partial<T> | ((records: T[]) => Partial<T>)) => void

type DynamicInputsReturn<T = Record<string, unknown>> = {
	addInput: AddInputHandler<T>
	removeInput: (i: number) => T
	paths: string[]
}

const useDynamicInputs = <T extends Record<string, unknown>>({ model, emptyData }: DynamicInputsProps<T>): DynamicInputsReturn<T> => {
	const { setData, unsetData, getData } = useForm()
	const { model: formModel } = useFormMeta()
	let inputModel = formModel ?? ""

	try {
		const nestedModel = useNestedAttribute()
		inputModel = formModel ? `${inputModel}.${nestedModel}` : nestedModel
	} catch(e) {}

	inputModel = `${inputModel}.${model || ""}`

	const handleAddInputs: AddInputHandler<T> = useCallback(override => {
		setData((formData: T) => {
			const clone = structuredClone(formData)
			let node = get(clone, inputModel) as T[]

			if(!node || !Array.isArray(node)) {
				set(clone, inputModel, [])
				node = get(clone, inputModel) as T[]
			}

			let merge: Partial<T> = {}
			if(override instanceof Function) {
				merge = override(node)
			} else if(override !== undefined) {
				merge = override
			}

			node.push(Object.assign(emptyData, merge))
			set(clone, inputModel, node)

			return clone
		})
	}, [])

	const handleRemoveInputs = useCallback((i: number) => {
		const record = getData(`${inputModel}[${i}]`) as T
		unsetData(`${inputModel}[${i}]`)
		return record
	}, [])

	const data = getData(inputModel)

	const generatePaths = useCallback(() => {
		if(!Array.isArray(data)) return []

		return data.map((_, i) => `${model || ""}[${i}]`)
	}, [data])

	return {
		addInput: handleAddInputs,
		removeInput: handleRemoveInputs,
		paths: generatePaths(),
	}
}

export default useDynamicInputs
