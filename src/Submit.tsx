import React from 'react'
import { useForm } from './Form'

const Button = ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
	return <button { ...props }>{ children }</button>
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	component: React.ElementType
}

const Submit = ({ children, type="submit", disabled, component = Button, ...props }: ButtonProps) => {
	const { processing } = useForm()

	if(typeof component === 'string') {
		return React.createElement(component, { children, type, disabled: disabled || processing, ...props })
	}

	return React.cloneElement(component, { children, type, disabled: disabled || processing, ...props })
}

export default Submit


