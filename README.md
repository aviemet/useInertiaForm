# Introduction

A hook for using forms with Inertia.js, meant to be used as a direct replacement of Inertia's `useForm` hook.

It address two issues with the original; [the bug preventing the `transform` method from running on submit](https://github.com/inertiajs/inertia/issues/1131), and [the lack of support for nested form data](https://github.com/inertiajs/inertia/discussions/1174).

This was developed alongside a Rails project, so the form handling ethos follows Rails conventions, however, effort was taken to make it as agnostic as possible and it should be useable in a Laravel application as well.

[Here is a codesandbox with usage examples for all hooks and components](https://codesandbox.io/s/useinertiaform-examples-0so45f)

## useInertiaForm

This hook returns a superset of the original return values of `useForm`, meaning it can be swapped in without breaking anything. While many of the methods have been modified to allow for managing nested form data, they all "fall back" to the original functionality when called with the original signatures.

`useInertiaForm` overrides the signature of `setData`, allowing the use of dot-notation when supplying a string as its first argument. It also overrides `setErrors`, `getError` and `setDefaults`, and provides the new methods `getData` and `unsetData` to allow easily setting and getting nested form data and errors. All of the nested data handlers use the lodash methods `set`, `unset` and `get`.

Initial data values are run through a sanitizing method which replaces any `null` or `undefined` values with empty strings. React cannot register that an input is controlled if its initial value is `null` or `undefined`, so doing this allows you to directly pass returned json from the server, which may have undefined values, into the hook without React complaining.

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

Retrieve errors using dot notation as keys. Errors are not stored as nested data, but rather with the nested data "address" as a key. This mimics the way errors are returned from the server, but still allows us to use the same lookup string for both the data and the errors.

```javascript
getError('user.firstName')
// 'Must exist'
```

In order to make error retrieval match the keys used for data setting and getting, errors returned by the server are prepended with a model name. However, this is only done if the original data passed to `useInertiaForm` has a single parent key. For instance, if the form data is a user object as such:

```javascript
const form = useInertiaForm({
  user: {
    username: 'somebody'
  }
})
```

In the example above, data and error setters and getters will work with the following values:

```javascript
form.getData('user.username')
form.setData('user.username', 'other')

form.getError('user.username')
form.setError('user.username', 'An Error!')
```

If form data is a flat object, or has two root models, the keys won't be rewritten:

```javascript
const form = useInertiaForm({
  username: 'somebody',
  firstName: 'Some',
  lastName: 'Body',
})

form.getData('username')
form.setData('username', 'other')

form.getError('username')
form.setError('username', 'An Error!')
```

## &lt;Form&gt;

Provides context for using form data and `useInertiaInput`. For rails backends, setting the prop `railsAttributes` to true will rewrite nested form data keys, appending the string "_attributes". This makes it possible to use `accepts_nested_attributes_for` in an ActiveRecord model.

| Prop              | Default     | Description |
| ----------------- | ----------- | -- |
| `data`            | `n/a`       | Default data assigned to form.data. Creates a copy which is automatically used for form data in a `useInertiaInput` hook |
| `model`           | `undefined` | The root model for the form. If provided, all get and set operations in nested `useInertiaInput` elements will append the model to the dot notation string |
| `method`          | `'post`     | HTTP method to use for the form |
| `to`              | `undefined` | Path to send the request to when the form is submitted. If this is omitted, submitting the form will do nothing except call `onSubmit` |
| `async`           | `false`     | If true, uses `axios` methods to send form data. If false, uses Inertia's `useForm.submit` method. |
| `remember`        | `true`      | If true, stores form data in local storage using the key `${method}/${model \|\| to}`. If one of `model` or `to` are not defined, data is not persisted |
| `railsAttributes` | `false`     | If true, appends '_attributes' to nested data keys before submitting. |
| `filter`          | `undefined` | An array of dot notation strings to call `unset` on before setting form data. This can be used to exclude data which you may need in your view, but do not want in your form data. For instance, an "edit" page may need the model `id` to pass the correct route to the `to` prop, while needing to exclude it from the form data. |
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
    <Form model="user" data={ { user } } to={ `users/${user.id}` } method="patch">
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

## useInertiaInput

Provides methods for binding an input to a data value. Use it to create a reusable input component:

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
    { error && <div className="error">{ error }</div> }
  )
}

/* Rendering this somewhere ... */

<TextInput name="firstName" model="user" label="First Name" />

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

const PageWithFormOnIt = () => {
  return (
    <Form model="user" data={ { user } } to={ `users/${user.id}` } method="patch">
      <TextInput name="firstName" label="First Name" />

      <NestedFields model="preferences">
        <TextInput name="princess" label="Favorite Princess" />
        <TextInput name="sword" label="Favorite Sword" />
      </NestedFields>
    </Form>
  )
}
```

## useDynamicInputs

Provides methods for managing arrays in form data. Use it to make a reusable component with your own buttons and styles:

```javascript
const DynamicInputs = ({ children, model, label, emptyData }) => {
  const { addInput, removeInput, paths } = useDynamicInputs({ model, emptyData })

  return (
    <>
      <div style={ { display: 'flex' } }>
        <label style={ { flex: 1 } }>{ label }</label>
        <button onClick={ addInput }>+</button>
      </div>

      { paths.map((path, i) => (
        <NestedFields key={ i } model={ path }>
          <div style={ { display: 'flex' } }>
            <div>{ children }</div>
            <button onClick={ onClick: () => removeInput(i) }>-</button>
          </div>
        </NestedFields>
      )) }
    </>
  )
}
```

This can then be used inside of a Form component:

```javascript
const user = {
  user: {
    username: "bmo",
    emails: [
      { email: "bmo@treehouse.ooo", type: "personal" }
    ]
  }
}

const PageWithFormOnIt = () => {
  return (
    <Form model="user" data={ { user } } to={ `users/${user.id}` } method="patch">
      <TextInput name="firstName" label="First Name" />

      <DynamicInputs model="emails" emptyData={ { email: '', type: ''} } label="Emails">
        <TextInput name="email" label="Email" />
        <TextInput name="type" label="Type" />
      </DynamicInputs>
    </Form>
  )
}
```

A component called `DynamicInputs` is exported which implements this if you don't need to customize how the HTML is generated.

### &lt;Submit&gt;

Since the `Form` component submits data by intercepting the `submit` event, this button actually does very little. Mostly, it disables the submit button while the form is processing to avoid double submits. It does this by passing `disabled` as a prop to the button element, which itself can be customized using the `component` prop. It accepts either a string or a React component, so if you use anything other than a button, you'll need to manually trigger the form submit action somehow.

An example of customizing the submit button using Mantine:

```typescript
import React, { forwardRef } from 'react'
import { Button, ButtonProps } from '@mantine/core'
import { Submit as SubmitButton, useForm } from 'use-inertia-form'

const Submit = forwardRef<HTMLButtonElement, ButtonProps>((
  { children, disabled, ...props },
  ref,
) => {
  const { processing, isDirty } = useForm()
  return (
      <SubmitButton
        component={ Button }
        ref={ ref }
        disabled={ disabled || processing || !isDirty }
        { ...props }
      >
        { children }
      </SubmitButton>
  )
})

export default Submit
```
