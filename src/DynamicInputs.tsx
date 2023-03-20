import React from 'react'
import { useForm, useFormMeta } from './Form'
import { get, set } from 'lodash'
import NestedFields, { useNestedAttribute } from './NestedFields'
import { NestedObject } from './useInertiaForm'

interface IDynamicInputsProps {
	children: React.ReactNode
	emptyData: Record<string, unknown>
	addInputButton?: JSX.Element
	removeInputButton?: JSX.Element
}

/**
 * Provides the basis for dynamic inputs.
 * Uses dot notation for storing results in an array on the nested
 *   data object. Buttons are configurable.
 */
const DynamicInputs = ({
	children,
	emptyData,
	addInputButton = <button>+</button>,
	removeInputButton = <button>-</button>,
}: IDynamicInputsProps) => {
	const { setData, unsetData, getData } = useForm()
	const { model: formModel } = useFormMeta()
	let inputModel = formModel ?? ''

	try {
		const nestedModel = useNestedAttribute()
		inputModel = formModel ? `${inputModel}.${nestedModel}` : nestedModel
	} catch(e) {}

	const handleAddInputs = () => {
		if(!formModel) return

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
	}

	const handleRemoveInputs = (i: number) => {
		unsetData(`${inputModel}[${i}]`)
	}

	const data = getData(inputModel)

	return (
		<>
			{ React.cloneElement(addInputButton, { onClick: handleAddInputs, type: 'button' }) }
			{ Array.isArray(data) && data.map((_: unknown, i: number) => (
				<NestedFields key={ i } model={ `[${i}]` }>
					<div>{ children }</div>
					{ React.cloneElement(removeInputButton, { onClick: () => handleRemoveInputs(i), type: 'button' }) }
				</NestedFields>
			)) }
		</>
	)
}

export default DynamicInputs

