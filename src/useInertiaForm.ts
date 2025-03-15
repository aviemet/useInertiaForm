import {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react"
import {
	ActiveVisit,
	Method,
	type Page,
	type PageProps,
	type PendingVisit,
	type Progress,
	type VisitOptions as InertiaVisitOptions,
	type RequestPayload,
} from "@inertiajs/core"
import { router } from "@inertiajs/react"
import {
	coerceArray,
	fillEmptyValues,
	renameObjectWithAttributes,
	unsetCompact,
	useMaybeRemember,
	type Path,
	type PathValue,
} from "./utils"
import { get, isEqual, isPlainObject, set } from "lodash"
import { useFormMeta } from "./Form/FormMetaWrapper"
import axios, { AxiosResponse } from "axios"

type VisitOptions<TAsync extends boolean = boolean> =	(Omit<InertiaVisitOptions, "errors" | "onSuccess"> & {
	errors?: Record<string, string | string[]>
	async: TAsync
	onSuccess?: (page: TAsync extends true ? AxiosResponse<any, any> : Page<PageProps>) => void
})

type OnChangeCallback = (key: string | undefined, value: unknown, prev: unknown) => void

export type Primitive = string | number | null | undefined

export type NestedObject = {
	[key: string]: unknown | NestedObject | NestedObject[]
}

type setDataByPath<TForm> = <P extends Path<TForm>>(key: P, value: PathValue<TForm, P>) => void
type setDataByString = (key: string, value: unknown) => void
type setDataByObject<TForm> = (data: TForm) => void
type setDataByMethod<TForm> = (data: (previousData: TForm) => TForm) => void

type getDataByPath<TForm> = <P extends Path<TForm>>(key: P) => PathValue<TForm, P>
type getDataByString = (key: string) => unknown

type unsetDataByPath<TForm> = (key: Path<TForm>) => void
type unsetDataByString = (key: string) => void

type resetAll = () => void
type resetByPath<TForm> = (field: Path<TForm> | Path<TForm>[]) => void
type resetByString = (field: string | string[]) => void

type setErrorByPath<TForm> = (field: Path<TForm>, value: string | string[]) => void
type setErrorByString = (field: string, value: string | string[]) => void
type setErrorByObject = (errors: Record<string, string | string[]>) => void

type getErrorByPath<TForm> = (field: Path<TForm>) => string | string[] | undefined
type getErrorByString = (field: string) => string | string[] | undefined

type clearAllErrors = () => void
type clearErrorsByPath<TForm> = (field: Path<TForm> | Path<TForm>[]) => void
type clearErrorsByString = (field: string | string[]) => void

export interface UseInertiaFormProps<TForm> {
	data: TForm
	isDirty: boolean
	errors: Partial<Record<keyof TForm, string | string[]>>
	hasErrors: boolean
	processing: boolean
	progress: Progress | null
	wasSuccessful: boolean
	recentlySuccessful: boolean
	setData: setDataByObject<TForm> & setDataByMethod<TForm> & setDataByPath<TForm> & setDataByString
	getData: getDataByPath<TForm> & getDataByString
	unsetData: unsetDataByPath<TForm> & unsetDataByString
	transform: (callback: (data: TForm) => TForm) => void
	onChange: (callback: OnChangeCallback) => void
	setDefaults(): void
	setDefaults(field: string, value: string): void
	setDefaults(fields: TForm): void
	reset: resetAll & resetByPath<TForm> & resetByString
	clearErrors: clearAllErrors & clearErrorsByPath<TForm> & clearErrorsByString
	setError: setErrorByPath<TForm> & setErrorByString & setErrorByObject
	getError: getErrorByPath<TForm> & getErrorByString
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
	rememberKeyOrInitialValues?: string | TForm,
	maybeInitialValues?: TForm,
): UseInertiaFormProps<TForm> {
	// Data
	const getFormArguments = useCallback((): [string, TForm] => {
		let rememberKey: string = null
		let transformedData = rememberKeyOrInitialValues
		if(typeof rememberKeyOrInitialValues === "string") {
			rememberKey = rememberKeyOrInitialValues
			transformedData = maybeInitialValues
		}
		return [rememberKey, fillEmptyValues(transformedData as TForm)]
	}, [rememberKeyOrInitialValues, maybeInitialValues])

	const [rememberKey, transformedData] = getFormArguments()

	const [defaults, setDefaults] = useState(transformedData || {} as TForm)
	const [data, setData] = useMaybeRemember<TForm>(transformedData, rememberKey ? `${rememberKey}:data` : undefined)

	// Detect root model name
	const rootModelKey = useMemo(() => {
		const keys = data ? Object.keys(data) : []

		if(keys.length === 1 && isPlainObject(data[keys[0]])) {
			return keys[0]
		}
		return undefined
	}, [data])

	// Errors
	const [errors, setErrors] = useMaybeRemember<Partial<Record<keyof TForm, string>>>({}, rememberKey ? `${rememberKey}:errors` : undefined)
	const [hasErrors, setHasErrors] = useState(false)

	// Use to prepend root model name to errors returned by the server
	const rewriteErrorKeys = (errors: Partial<Record<keyof TForm, string>>) => {
		if(!errors || !rootModelKey) return errors

		const newErrors = {}
		Object.keys(errors).forEach(key => {
			newErrors[`${rootModelKey}.${key}`] = errors[key]
		})
		return newErrors
	}

	// Submit request processes
	const [processing, setProcessing] = useState(false)
	const [progress, setProgress] = useState<Progress>()
	const [wasSuccessful, setWasSuccessful] = useState(false)
	const [recentlySuccessful, setRecentlySuccessful] = useState(false)
	const cancelToken = useRef<any>(null)
	const recentlySuccessfulTimeoutId = useRef<NodeJS.Timeout>(null)

	let transformRef = useRef((data: TForm) => data)
	const isMounted = useRef<boolean>(null)

	useEffect(() => {
		isMounted.current = true
		return () => {
			isMounted.current = false
		}
	}, [])

	// OnChange function processes
	let onChangeRef = useRef<OnChangeCallback>(null)
	let onChangeArgsRef = useRef<Parameters<OnChangeCallback>>(null)

	useEffect(() => {
		if(onChangeRef.current && onChangeArgsRef.current) {
			onChangeRef.current(...onChangeArgsRef.current)
		}
	}, [data])

	// Check if this was called in the context of a Form component and store `railsAttributes`
	let railsAttributes = false
	try {
		const meta = useFormMeta()
		railsAttributes = meta.railsAttributes
	// eslint-disable-next-line no-unused-vars
	} catch(e) {}

	const submit = (method: Method, url: string, options: VisitOptions = {
		async: false,
	}) => {
		const _options: VisitOptions = {
			...options,
			onCancelToken: (token) => {
				cancelToken.current = token

				if(options.onCancelToken) {
					return options.onCancelToken(token)
				}
			},
			onBefore: (visit: PendingVisit) => {
				setWasSuccessful(false)
				setRecentlySuccessful(false)
				clearTimeout(recentlySuccessfulTimeoutId.current)

				if(options.onBefore) {
					return options.onBefore(visit)
				}
			},
			onStart: (visit: PendingVisit) => {
				setProcessing(true)

				if(options.onStart) {
					return options.onStart(visit)
				}
			},
			onProgress: (event: Progress) => {
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
			onError: (errors: Partial<Record<keyof TForm, string>>) => {
				if(isMounted.current) {
					setProcessing(false)
					setProgress(null)
					setErrors(rewriteErrorKeys(errors))
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
			onFinish: (visit: ActiveVisit) => {
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
		if(options.async === true) {
			_options.onBefore(undefined)
			_options.onStart(undefined)
			axios[method](url, transformedData as RequestPayload, {
				onUploadProgress: progressEvent => {
					_options.onProgress(progressEvent)
				},
			})
				.then(response => {
					_options.onSuccess(response)
				})
				.catch(error => {
					_options.onError(error)
				})
				.finally(() => {
					_options.onFinish(undefined)
				})
		} else {
			if(method === "delete") {
				router.delete(url, { ..._options, data: transformedData as RequestPayload })
			} else {
				router[method](url, transformedData as RequestPayload, _options)
			}
		}
	}

	const clearErrors = (fields?: string | string[] | Path<TForm> | Path<TForm>[]) => {
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
	}

	return {
		data,
		isDirty: !isEqual(data, defaults),
		errors,
		hasErrors,
		processing,
		progress,
		wasSuccessful,
		recentlySuccessful,

		transform: (callback) => {
			transformRef.current = callback
		},

		onChange: (callback) => {
			onChangeRef.current = callback
		},

		setData: (keyOrData: string | TForm | ((previousData: TForm) => TForm), maybeValue?: any) => {
			if(typeof keyOrData === "string") {
				return setData(data => {
					const clone = structuredClone(data)
					if(onChangeRef.current) {
						onChangeArgsRef.current = [keyOrData, maybeValue, get(data, keyOrData)]
					}

					set(clone as NestedObject, keyOrData, maybeValue)

					return clone
				})
			}

			if(keyOrData instanceof Function) {
				setData((data) => {
					const clone = keyOrData(structuredClone(data))
					if(onChangeRef.current) {
						onChangeArgsRef.current = [undefined, clone, data]
					}
					return clone
				})
				return
			}

			if(onChangeRef.current) {
				onChangeArgsRef.current = [undefined, data, keyOrData]
			}

			setData(keyOrData)
		},

		getData: (key: string): any => {
			return get(data, key)
		},

		unsetData: (key: string) => {
			setData(data => {
				const clone = structuredClone(data)
				if(onChangeRef.current) {
					onChangeArgsRef.current = [key, get(data, key), undefined]
				}
				unsetCompact(clone as NestedObject, key)
				return clone
			})
		},

		setDefaults: (fieldOrFields?: string | TForm, maybeValue?: string) => {
			if(fieldOrFields === undefined) {
				setDefaults(() => data)
				return
			}

			setDefaults((defaults) => ({
				...defaults,
				...(typeof fieldOrFields === "string" ? { [fieldOrFields]: maybeValue } : (fieldOrFields as TForm)),
			}))
		},

		reset: (fields?: string | string[]) => {
			if(!fields) {
				if(onChangeRef.current) {
					onChangeArgsRef.current = [undefined, defaults, data]
				}
				setData(defaults)
				setErrors({})
				return
			}

			const arrFields = coerceArray(fields)

			const clone = structuredClone(data)
			arrFields.forEach(field => {
				set(clone as NestedObject, field, get(defaults, field))
			})
			clearErrors(fields)
			if(onChangeRef.current) {
				onChangeArgsRef.current = [undefined, clone, data]
			}
			setData(clone)
		},

		setError: (fieldOrFields: string | Record<string, string | string[]>, maybeValue?: string) => {
			setErrors((errors) => {
				const newErrors = {
					...errors,
					...(typeof fieldOrFields === "string"
						? { [fieldOrFields]: maybeValue }
						: (fieldOrFields as Record<keyof TForm, string>)),
				}
				setHasErrors(Object.keys(newErrors).length > 0)
				return newErrors
			})
		},

		getError: (key: string): string | string[] => {
			return get(errors, key)
		},

		clearErrors,

		submit,

		get: (url, options) => {
			submit("get", url, options)
		},

		post: (url, options) => {
			submit("post", url, options)
		},

		put: (url, options) => {
			submit("put", url, options)
		},

		patch: (url, options) => {
			submit("patch", url, options)
		},

		delete: (url, options) => {
			submit("delete", url, options)
		},

		cancel: () => {
			if(cancelToken.current) {
				cancelToken.current.cancel()
			}
		},
	}
}
