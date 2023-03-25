# Introduction

A hook for using forms with Inertia.js, meant to be used as a direct replacement of Inertia's `useForm` hook.

It address two issues with the original; [the bug preventing the `transform` method from running on submit](https://github.com/inertiajs/inertia/issues/1131), and [the lack of support for nested form data](https://github.com/inertiajs/inertia/discussions/1174).

This was developed alongside a Rails project, so the form handling ethos follows Rails conventions, however, effort was taken to make it as agnostic as possible and it should be useable in a Laravel application as well.

This package provides three main exports; `useInertiaForm`, `useInertiaInput`, and `Form`.

## useInertiaForm

This hook returns a superset of the original return values of `useForm`, meaning it can be swapped in without breaking anything. It overrides the signature of `setData`, allowing the use of dot-notation when supplying a string as its first argument. It also overrides `setErrors`, `getError` and `setDefaults`, and provides the new methods `getData` and `unsetData` to allow easily setting and getting nested form data and errors. All of the nested data handlers use the lodash methods `set`, `unset` and `get`.

Initial data values are run through a sanitizing method which replaces any `null` or `undefined` values with empty strings. React cannot register that an input is controlled if its initial value is `null` or `undefined`, so doing this allows you to directly pass returned json from the server which may have undefined values into the hook without React complaining.

Instantiate it the same way you would with Inertia's `useForm`:

```javascript
const { data, setData, getData, unsetData, setError, getError } = useInertiaForm({
  user: {
    firstName: 'Finn'
    lastName: undefined
  }
})
console.log(data)
/* {
  user: {
    firstName: 'Finn',
    lastName: ''
  }
} */
```

### `setData`

You can now use dot-notation to set nested data on the form data object.

```javascript
setData('user.lastName', 'Human')
setData('user.brothers[0]', 'Jake')
/* { 
  user: { 
    firstName: 'Finn',
    lastNameName: 'Human'
    brothers: ['Jake']
  } 
} */
```

### `getData`

Retrieve nested data using dot-notation.

```javascript
getData('user.firstName')
// 'Finn'
```

### `unsetData`

Safely destroy a nested value on the form data object.

```javascript
unsetData('user.brothers')
/* { 
  user: { 
    firstName: 'Finn'
    lastNameName: 'Human'
  } 
} */
```

### `getError`

Retrieve errors using dot notation.

```javascript
getError('user.firstName')
// 'Must not be blank'
```

## useInertiaInput

This hook must be consumed within the context of the provided `<Form>` component.

While it's possible to use this in a component to define each input for a form, it's intended to be used to define custom input components.

```javascript
const TextInput = ({ name, model, label }) => {
  const { inputName, inputId, value, setValue, error } = useInertiaInput({ name, model })

  return (
    <label for={ inputId }>{ label }</label>
    <input
      id={ inputId }
      type='text'
      name={ inputName }
      value={ value }
      onChange={ setValue(e => e.target.value) }
    >
    { error ?? <div className="error">{ error }</div> }
  )
}

/* Rendering this somewhere ... */

<TextInput name="firstName" model="user" label="First Name" />

```

This will produce the following HTML:

```html
<label for="user_firstName">First Name</label>
<input id="user_firstName" type="text" name="user.firstName" value="">
```

## &lt;Form&gt;

Provides context for using form data and `useInertiaInput`. For rails backends, setting the prop `railsAttributes` to true will rewrite nested form data keys, appending the string "_attributes". This makes it possible to use `accepts_nested_attributes_for` in an ActiveRecord model.

| Prop            | Default   | Description |
| --------------- | --------- | -- |
| `data`            | `n/a`   | Default data assigned to form.data. Creates a copy which is automatically used for form data in a `useInertiaInput` hook |
| `model`           | `undefined` | The root model for the form. If provided, all get and set operations in nested `useInertiaInput` elements will append the model to the dot notation string |
| `method`          | `'post`   | HTTP method to use for the form |
| `to`              | `undefined` | Path to send the request to when the form is submitted. If this is omitted, submitting the form will do nothing except call `onSubmit` |
| `async`           | `false`     | If true, uses `axios` methods to send form data. If false, uses Inertia's `useForm.submit` method. |
| `remember`        | `true`      | If true, stores form data in local storage using the key `${method}/${model \|\| to}`. If one of `model` or `to` are not defined, data is not persisted |
| `railsAttributes` | `false`     | If true, appends '_attributes' to nested data keys before submitting. |
| `onSubmit`        | `undefined` | Called when the form is submitted, fired just before sending the request. If the method returns `false`, submit is canceled |
| `onChange`        | `undefined` | Called every time the form data changes |
| `onSuccess`       | `undefined` | Called when the form has been successfully submitted |
| `onError`         | `undefined` | Called when an error is set, either manually or by a server response |

Basic example (using the `TextInput` component defined in the example above):

```javascript
const user = {
  user: {
    firstName: "Jake",
    email: "jake@thetreehouse.ooo"
  }
}

const PageWithFormOnIt = ({ user }) => {
  return (
    <Form
      model="user"
      data={ { user } }
      to={ `users/${user.id}` }
      method="patch"
    >
      <TextInput name="firstName" label="First Name" />

      <TextInput name="email" label="Email" />
    </Form>
  )
}
```

In order to wrap the `Form` component in your own component, for styling or any other purpose, you'll need to extend the `NestedObject` type when using typescript.

```typescript
import React from 'react'
import { Form as InertiaForm, type FormProps, type NestedObject } from 'use-inertia-form'

interface IFormProps<TForm> extends FormProps<TForm> {
  wrapperClassName: string
}

const MyForm = <TForm extends NestedObject>(
  { children, model, wrapperClassName, railsAttributes = true, ...props }: IFormProps<TForm>,
) => {
  return (
    <div className={ `${model}-form wrapperClassName` }>
      <InertiaForm
        railsAttributes={ railsAttributes }
        { ...props }
      >
        { children }
      </InertiaForm>
    </div>
  )
}

export default MyForm
```

### &lt;NestedFields&gt;

Provides context for nesting inputs.

```javascript
const user = {
  firstName: 'Finn',
  preferences: {
    princess: 'Bubblegum',
    sword: 'Scarlet'
  }
}

const PageWithFormOnIt = ({ user }) => {
  return (
    <Form
      model="user"
      data={ { user } }
      to={ `users/${user.id}` }
      method="patch"
    >
      <TextInput name="firstName" label="First Name" />

      <NestedFields model="preferences">
        <TextInput name="princess" label="Favorite Princess" />
        <TextInput name="sword" label="Favorite Sword" />
      </NestedFields>
    </Form>
  )
}
```

### &lt;DynamicInputs&gt;

Provides an interface for array data.

```javascript
const user = {
  firstName: 'Finn',
  emails: [
    { email: 'finn@treehouse.ooo', type: 'personal' },
    { email: 'professional@human.ooo', type: 'work' }
  ]
}

const emptyEmail = { email: '', type: '' }

const PageWithFormOnIt = ({ user }) => {
  return (
    <Form
      model="user"
      data={ { user } }
      to={ `users/${user.id}` }
      method="patch"
    >
      <TextInput name="firstName" label="First Name" />

      <DynamicInputs emptyData={ emptyEmail }>
        <TextInput name="email" label="Email" />
        <TextInput name="type" label="Email Type" />
      </DynamicInputs>
    </Form>
  )
}
```

This will render two sets of inputs, one for each email object in the initial data passed to the form. It also renders buttons for adding and removing sets of inputs which can be customized using the `addInputButton` and `removeInputButton` props.

### &lt;Submit&gt;

Renders a button which will submit the form. Passes the `disabled` prop to the enclosed button if the form is processing. Accepts a component as a prop for use with component libraries.
