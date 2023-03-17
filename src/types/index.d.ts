type Primitive = string|number|symbol

export type NestedObject = {
	[key: string]: NestedObject|NestedObject[]|Primitive|Primitive[]|undefined|null
};
