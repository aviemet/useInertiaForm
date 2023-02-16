import React from 'react'
import { useForm, useFormMeta } from './Form'
import { cloneDeep, get, set } from 'lodash'
import { useNestedAttribute } from './NestedFields'

interface IDynamicInputsProps {
	children: React.ReactNode
	emptyData: Record<string, any>
	addInputButton: JSX.Element
	removeInputButton: JSX.Element
}

const DynamicInputs = ({ 
	children, 
	emptyData, 
	addInputButton = <button>+</button>,
	removeInputButton = <button>-</button>
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

		setData((formData: Record<string, any>) => {
			const clone = cloneDeep(formData)
			let node = get(clone, inputModel)

			if(!node) {
				set(clone, inputModel, [])
				node = get(clone, inputModel)
			}

			node.push(emptyData)
			set(clone, inputModel, node)

			return clone
		})
	}

	const handleRemoveInputs = (i: number) => {
		unsetData(`${inputModel}[${i}]`)
	}

	return (
		<>
			{ React.cloneElement(addInputButton, { onClick: handleAddInputs }) }
			{ Array.isArray(getData(inputModel)) && getData(inputModel).map((_: any, i: number) => (
				<>
					<div>{ children }</div>
					{ React.cloneElement(removeInputButton, { onClick: handleRemoveInputs(i) })}
				</>
			)) }
		</>
	)
}

export default DynamicInputs
