export type InputStrategy = (name: string, model?: string) => {
	inputId: string
	inputName: string
}

/**
 * Standard input strategy:
 *  name: dot notation with array awareness
 *  model: snake case based on nested models and input name
 */
const inputStrategy: InputStrategy = (name, model) => {
	if(!model) {
		return {
			inputId: name,
			inputName: name,
		}
	}

	let inputName: string

	if(name.charAt(0) === '[') {
		inputName = `${model}${name}`
	} else {
		inputName = `${model}.${name}`
	}

	return {
		inputId: `${model}_${name}`.replace('.', '_').replace(/\[(\d)\]/, '_$1'),
		inputName: inputName,
	}
}

export default inputStrategy
