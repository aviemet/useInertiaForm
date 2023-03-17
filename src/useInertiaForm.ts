import { Method, Progress, router, VisitOptions } from '@inertiajs/core'
import { get, isEqual, set } from 'lodash'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useRemember } from '@inertiajs/react'
import { fillEmptyValues, renameWithAttributes, unsetCompact } from './utils'
import { useFormMeta } from './Form/FormMetaWrapper'
import { type NestedObject } from './types'

type setDataByObject<TForm> = (data: TForm) => void
type setDataByMethod<TForm> = (data: (previousData: TForm) => TForm) => void
type setDataByKeyValuePair = (key: string, value: unknown) => void;

export interface UseInertiaFormProps<TForm extends NestedObject> {
	data: TForm
	isDirty: boolean
	errors: Partial<Record<keyof TForm, string|string[]>>
	hasErrors: boolean
	processing: boolean
	progress: Progress | null
	wasSuccessful: boolean
	recentlySuccessful: boolean
	setData: setDataByObject<TForm> & setDataByMethod<TForm> & setDataByKeyValuePair
	getData: (key: string) => unknown
	unsetData: (key: string) => void
	transform: (callback: (data: TForm) => TForm) => void
	setDefaults(): void
	setDefaults(field: keyof TForm, value: string): void
	setDefaults(fields: Record<keyof TForm, string>): void
	reset: (...fields: (keyof TForm)[]) => void
	clearErrors: (...fields: (keyof TForm)[]) => void
	setError(field: string, value: string): void
	setError(errors: Record<string, string|string[]>): void
	getError: (key: string) => string|string[]
	submit: (method: Method, url: string, options?: VisitOptions) => void
	get: (url: string, options?: VisitOptions) => void
	patch: (url: string, options?: VisitOptions) => void
	post: (url: string, options?: VisitOptions) => void
	put: (url: string, options?: VisitOptions) => void
	delete: (url: string, options?: VisitOptions) => void
	cancel: () => void
}
export default function useInertiaForm<TForm extends NestedObject>(initialValues?: TForm): UseInertiaFormProps<TForm>
export default function useInertiaForm<TForm extends NestedObject>(
	rememberKey: string,
	initialValues?: TForm,
): UseInertiaFormProps<TForm>
export default function useInertiaForm<TForm extends NestedObject>(
	rememberKeyOrInitialValues?: string | TForm,
	maybeInitialValues?: TForm,
): UseInertiaFormProps<TForm> {
	const isMounted = useRef<boolean>()

	// Data
	const rememberKey = typeof rememberKeyOrInitialValues === 'string' ? rememberKeyOrInitialValues : null
	const transformedData = fillEmptyValues((typeof rememberKeyOrInitialValues === 'string' ? maybeInitialValues : rememberKeyOrInitialValues) || ({} as TForm))
	const [defaults, setDefaults] = useState(transformedData)
	const [data, setData] = rememberKey ? useRemember(defaults, `${rememberKey}:data`) : useState(defaults)

	// Errors
	const [errors, setErrors] = rememberKey
		? useRemember({} as Partial<Record<keyof TForm, string>>, `${rememberKey}:errors`)
		: useState({} as Partial<Record<keyof TForm, string>>)
	const [hasErrors, setHasErrors] = useState(false)

	// Submit request processes
	const [processing, setProcessing] = useState(false)
	const [progress, setProgress] = useState(null)
	const [wasSuccessful, setWasSuccessful] = useState(false)
	const [recentlySuccessful, setRecentlySuccessful] = useState(false)
	const cancelToken = useRef<any>(null)
	const recentlySuccessfulTimeoutId = useRef<NodeJS.Timeout>()

	let transformRef = useRef((data) => data)

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
				onFinish: () => {
					if(isMounted.current) {
						setProcessing(false)
						setProgress(null)
					}

					cancelToken.current = null

					if(options.onFinish) {
						// @ts-ignore
						return options.onFinish()
					}
				},
			}

			if(method === 'delete') {
				router.delete(url, { ..._options, data: transformRef.current(data) })
			} else {
				router[method](url, transformRef.current(data), _options)
			}
		},
		[data, setErrors],
	)

	return {
		data,
		setData: useCallback((keyOrData: string | Function | TForm, maybeValue?: TForm[keyof TForm]) => {
			if(typeof keyOrData === 'string') {
				const processedKey = railsAttributes ? renameWithAttributes(keyOrData) : keyOrData
				setData((data) => {
					return set(structuredClone(data), processedKey, maybeValue)
				})
			} else if(typeof keyOrData === 'function') {
				setData((data) => keyOrData(data))
			} else {
				setData(keyOrData as TForm)
			}
		}, [railsAttributes]),
		getData: useCallback((key: string): unknown => {
			const processedKey = railsAttributes ? renameWithAttributes(key) : key
			return get(data, processedKey)
		}, [data, railsAttributes]),
		unsetData: useCallback((key: string) => {
			const processedKey = railsAttributes ? renameWithAttributes(key) : key
			const clone = structuredClone(data)
			unsetCompact(clone, processedKey)

			return setData(clone)
		}, [data, railsAttributes]),
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
		setDefaults: useCallback((fieldOrFields?: keyof TForm | Record<keyof TForm, string>, maybeValue?: string) => {
			if(typeof fieldOrFields === 'undefined') {
				setDefaults(() => data)
			} else {
				setDefaults((defaults) => ({
					...defaults,
					...(typeof fieldOrFields === 'string' ? { [fieldOrFields]: maybeValue } : (fieldOrFields as TForm)),
				}))
			}
		}, [data]),
		reset: useCallback((...fields) => {
			if(fields.length === 0) {
				setData(defaults)
			} else {
				setData(
					(Object.keys(defaults) as Array<keyof TForm>)
						.filter((key) => fields.includes(key))
						.reduce(
							(carry, key) => {
								carry[key] = defaults[key]
								return carry
							},
							{ ...data },
						),
				)
			}
		}, [defaults, data]),
		setError: useCallback((fieldOrFields: string | Record<string, string|string[]>, maybeValue?: string) => {
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
		clearErrors: useCallback((...fields) => {
			setErrors((errors) => {
				const newErrors = (Object.keys(errors) as Array<keyof TForm>).reduce(
					(carry, field) => ({
						...carry,
						...(fields.length > 0 && !fields.includes(field) ? { [field]: errors[field] } : {}),
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
