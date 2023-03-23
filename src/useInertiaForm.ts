import { useCallback, useEffect, useRef, useState } from 'react'
import { Method, Progress, VisitOptions, type RequestPayload } from '@inertiajs/core'
import { router } from '@inertiajs/react'
import { get, isEqual, set } from 'lodash'
import { useRemember } from '@inertiajs/react'
import { coerceArray, fillEmptyValues, renameObjectWithAttributes, unsetCompact } from './utils'
import { useFormMeta } from './Form/FormMetaWrapper'

export type Primitive = string|number|symbol|null|undefined

export type NestedObject = {
	[key: string]: unknown|NestedObject|NestedObject[]
};

type setDataByObject<TForm> = (data: TForm) => void
type setDataByMethod<TForm> = (data: (previousData: TForm) => TForm) => void
type setDataByKeyValuePair = (key: string, value: unknown) => void;

export interface UseInertiaFormProps<TForm> {
	data: TForm
	isDirty: boolean
	errors: Partial<Record<keyof TForm, string|string[]>>
	hasErrors: boolean
	processing: boolean
	progress: Progress|null
	wasSuccessful: boolean
	recentlySuccessful: boolean
	setData: setDataByObject<TForm> & setDataByMethod<TForm> & setDataByKeyValuePair
	getData: (key: string) => unknown|undefined
	unsetData: (key: string) => void
	transform: (callback: (data: TForm) => TForm) => void
	setDefaults(): void
	setDefaults(field: string, value: string): void
	setDefaults(fields: TForm): void
	reset: (fields?: string|string[]) => void
	clearErrors: (fields?: string|string[]) => void
	setError(field: string, value: string): void
	setError(errors: Record<string, string|string[]>): void
	getError: (key: string) => string|string[]|undefined
	submit: (method: Method, url: string, options?: VisitOptions) => void
	get: (url: string, options?: VisitOptions) => void
	patch: (url: string, options?: VisitOptions) => void
	post: (url: string, options?: VisitOptions) => void
	put: (url: string, options?: VisitOptions) => void
	delete: (url: string, options?: VisitOptions) => void
	cancel: () => void
}
export default function useInertiaForm<TForm>(initialValues?: TForm): UseInertiaFormProps<TForm>
export default function useInertiaForm<TForm>(
	rememberKey: string,
	initialValues?: TForm,
): UseInertiaFormProps<TForm>
export default function useInertiaForm<TForm>(
	rememberKeyOrInitialValues?: string|TForm,
	maybeInitialValues?: TForm,
): UseInertiaFormProps<TForm> {
	const isMounted = useRef<boolean>()

	// Data
	let rememberKey = null
	let transformedData = rememberKeyOrInitialValues
	if(typeof rememberKeyOrInitialValues === 'string') {
		rememberKey = rememberKeyOrInitialValues
		transformedData = maybeInitialValues
	}

	const [defaults, setDefaults] = useState((fillEmptyValues(transformedData) || {}) as TForm)
	const [data, setData] = rememberKey ? useRemember<TForm>(defaults, `${rememberKey}:data`) : useState<TForm>(defaults)

	// Errors
	const [errors, setErrors] = rememberKey
		? useRemember({} as Partial<Record<keyof TForm, string>>, `${rememberKey}:errors`)
		: useState({} as Partial<Record<keyof TForm, string>>)
	const [hasErrors, setHasErrors] = useState(false)

	// Submit request processes
	const [processing, setProcessing] = useState(false)
	const [progress, setProgress] = useState<Progress>()
	const [wasSuccessful, setWasSuccessful] = useState(false)
	const [recentlySuccessful, setRecentlySuccessful] = useState(false)
	const cancelToken = useRef<any>(null)
	const recentlySuccessfulTimeoutId = useRef<NodeJS.Timeout>()

	let transformRef = useRef((data: TForm) => data)

	useEffect(() => {
		isMounted.current = true
		return () => {
			isMounted.current = false
		}
	}, [])

	// Check if this was called in the context of a Form component and store `railsAttributes`
	let railsAttributes = false
	try {
		const meta = useFormMeta()
		railsAttributes = meta.railsAttributes
	} catch(e) {}

	const submit = useCallback(
		(method: Method, url: string, options: VisitOptions = {}) => {
			const _options = {
				...options,
				onCancelToken: (token) => {
					cancelToken.current = token

					if(options.onCancelToken) {
						return options.onCancelToken(token)
					}
				},
				onBefore: (visit) => {
					setWasSuccessful(false)
					setRecentlySuccessful(false)
					clearTimeout(recentlySuccessfulTimeoutId.current)

					if(options.onBefore) {
						return options.onBefore(visit)
					}
				},
				onStart: (visit) => {
					setProcessing(true)

					if(options.onStart) {
						return options.onStart(visit)
					}
				},
				onProgress: (event) => {
					setProgress(event)

					if(options.onProgress) {
						return options.onProgress(event)
					}
				},
				onSuccess: (page) => {
					if(isMounted.current) {
						setProcessing(false)
						setProgress(null)
						setErrors({})
						setHasErrors(false)
						setWasSuccessful(true)
						setRecentlySuccessful(true)
						recentlySuccessfulTimeoutId.current = setTimeout(() => {
							if(isMounted.current) {
								setRecentlySuccessful(false)
							}
						}, 2000)
					}

					if(options.onSuccess) {
						return options.onSuccess(page)
					}
				},
				onError: (errors) => {
					if(isMounted.current) {
						setProcessing(false)
						setProgress(null)
						setErrors(errors)
						setHasErrors(true)
					}

					if(options.onError) {
						return options.onError(errors)
					}
				},
				onCancel: () => {
					if(isMounted.current) {
						setProcessing(false)
						setProgress(null)
					}

					if(options.onCancel) {
						return options.onCancel()
					}
				},
				onFinish: (visit) => {
					if(isMounted.current) {
						setProcessing(false)
						setProgress(null)
					}

					cancelToken.current = null

					if(options.onFinish) {
						return options.onFinish(visit)
					}
				},
			}

			let transformedData = transformRef.current(structuredClone(data))
			if(railsAttributes) {
				transformedData = renameObjectWithAttributes(transformedData)
			}

			if(method === 'delete') {
				router.delete(url, { ..._options, data: transformedData as RequestPayload })
			} else {
				router[method](url, transformedData as RequestPayload, _options)
			}
		},
		[data, setErrors],
	)

	return {
		data,
		isDirty: !isEqual(data, defaults),
		errors,
		hasErrors,
		processing,
		progress,
		wasSuccessful,
		recentlySuccessful,

		transform: useCallback((callback) => {
			transformRef.current = callback
		}, []),

		setData: (keyOrData: string|TForm|((previousData: TForm) => TForm), maybeValue?: string|number|undefined) => {
			if(typeof keyOrData === 'string') {
				return setData(data => {
					const clone = structuredClone(data)
					set(clone as NestedObject, keyOrData, maybeValue)
					return clone
				})
			}

			if(keyOrData instanceof Function) {
				setData((data) => keyOrData(structuredClone(data)))
				return
			}

			setData(keyOrData)
		},

		getData: useCallback((key: string): unknown => {
			return get(data, key)
		}, [data]),

		unsetData: useCallback((key: string) => {
			setData(data => {
				const clone = structuredClone(data)
				unsetCompact(clone as NestedObject, key)
				return clone
			})
		}, [data]),

		setDefaults: useCallback((fieldOrFields?: string|TForm, maybeValue?: string) => {
			if(fieldOrFields === undefined) {
				setDefaults(() => data)
				return
			}

			setDefaults((defaults) => ({
				...defaults,
				...(typeof fieldOrFields === 'string' ? { [fieldOrFields]: maybeValue } : (fieldOrFields as TForm)),
			}))
		}, [data]),

		reset: useCallback((fields) => {
			if(!fields) {
				setData(defaults)
				return
			}

			const arrFields = coerceArray(fields)

			const clone = structuredClone(data)
			arrFields.forEach(field => {
				set(clone as NestedObject, field, get(defaults, field))
			})
			setData(clone)
		}, [defaults, data]),

		setError: useCallback((fieldOrFields: string|Record<string, string|string[]>, maybeValue?: string) => {
			setErrors((errors) => {
				const newErrors = {
					...errors,
					...(typeof fieldOrFields === 'string'
						? { [fieldOrFields]: maybeValue }
						: (fieldOrFields as Record<keyof TForm, string>)),
				}
				setHasErrors(Object.keys(newErrors).length > 0)
				return newErrors
			})
		}, [errors]),

		getError: useCallback((key: string): string|string[] => {
			return get(errors, key)
		}, [errors]),

		clearErrors: useCallback((fields) => {
			if(!fields) {
				setErrors({})
				return
			}

			const arrFields = coerceArray(fields)

			setErrors((errors) => {
				const newErrors = (Object.keys(errors) as Array<keyof TForm>).reduce(
					(carry, field) => ({
						...carry,
						...(arrFields.length > 0 && !arrFields.includes(String(field)) ? { [field]: errors[field] } : {}),
					}),
					{},
				)
				setHasErrors(Object.keys(newErrors).length > 0)
				return newErrors
			})
		}, [errors]),

		submit,

		get: useCallback((url, options) => {
			submit('get', url, options)
		}, []),

		post: useCallback((url, options) => {
			submit('post', url, options)
		}, []),

		put: useCallback((url, options) => {
			submit('put', url, options)
		}, []),

		patch: useCallback((url, options) => {
			submit('patch', url, options)
		}, []),

		delete: useCallback((url, options) => {
			submit('delete', url, options)
		}, []),

		cancel: useCallback(() => {
			if(cancelToken.current) {
				cancelToken.current.cancel()
			}
		}, [cancelToken.current]),
	}
}
