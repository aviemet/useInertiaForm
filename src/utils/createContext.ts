import React from "react"

/**
 * Creates context with simplified type notations
 * Wraps useContext hook in an error check to enforce context context
 */
export const createContext = <CT extends unknown | null>() => {
	const context = React.createContext<CT | undefined>(null)

	const useContext = <T extends CT = CT>() => {
		const c = React.useContext<T>(
			(context as unknown) as React.Context<T>,
		)
		if(c === null) {
			throw new Error("useContext must be inside a Provider with a value")
		}
		return c
	}

	return [useContext, context.Provider] as const
}
