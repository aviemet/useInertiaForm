import React from 'react'
import NestedFields from './NestedFields'
import useDynamicInputs from './useDynamicInputs'

export interface DynamicInputsProps {
	children: React.ReactNode
	model?: string
	emptyData: Record<string, unknown>
	addInputButton?: JSX.Element
	removeInputButton?: JSX.Element
}

const DynamicInputs = ({
	children,
	model,
	emptyData,
	addInputButton = <button>+</button>,
	removeInputButton = <button>-</button>,
}: DynamicInputsProps) => {
	const { addInput, removeInput, paths } = useDynamicInputs({ model, emptyData })

	return (
		<>
			{ React.cloneElement(addInputButton, { onClick: ( )=> addInput(), type: 'button' }) }
			{ paths.map((path, i) => (
				<NestedFields key={ i } model={ path }>
					<div>{ children }</div>
					{ React.cloneElement(removeInputButton, { onClick: () => removeInput(i), type: 'button' }) }
				</NestedFields>
			)) }
		</>
	)
}

export default DynamicInputs

