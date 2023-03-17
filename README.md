# Introduction

A hook for using Inertia.js forms, meant to be used as a direct replacement of Inertia's `useForm` hook.

It address two issues with the original; [the bug preventing the `transform` method from running on submit](https://github.com/inertiajs/inertia/issues/1131), and the lack of support for nested form data.

This was developed alongside a Rails project, so the form handling ethos follows Rails conventions, however, effort was taken to make it as agnostic as possible and it should be useable in a Laravel application as well.

This package provides three main exports; `useInertiaForm`, `useInertiaInput`, and `Form`.

## useInertiaForm

This hook returns a superset of the original return values of `useForm`, meaning it can be swapped in without breaking anything. It overrides the signature of `setData`, allowing the use of dot-notation when supplying a string as its first argument. It also overrides `setErrors`, `getError` and `setDefaults`, and provides the new methods `getData` and `unsetData` to allow easily setting and getting nested form data and errors. All of the nested data handlers use the lodash methods `set`, `unset` and `get`.

Initial data values are run through a sanitizing method which replaces any `null` or `undefined` values with empty strings. React cannot register that an input is controlled if its initial value is `null` or `undefined`, so doing this allows you to directly pass returned json from the server which may have undefined values into the hook without having React complain.

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
setData('user.lastNameName', 'Human')
setData('user.brothers[0]', 'Jake')
/* { 
  user: { 
    firstName: 'Finn',
    lastNameName: 'Human'
    brothers: ['Jake']
  } 
} */
```

If the first argument is not a string, falls back to using the Inertia implementation of `setData` which is a flat object assignment.

### `getData`

Allows looking up nested data using dot-notation.

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

### `setError`

Allows setting a nested error from the form errors object using dot notation.

```javascript
setError('user.firstName', 'Must not be blank')
```

### `getError`

Allows getting a nested error from the form errors object using dot notation.

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
    { error ?? <SomeErrorComponent>{ error }</SomeErrorComponent> }
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

Since most projects will define their own set of reusable components, a `<Form>` component has been provided which uses React's Context API to manage form state. In order to use `useInertiaInput`, it must be within the context of this component.

| Prop            | Default   | Description |
| --------------- | --------- | -- |
| `data`            | `n/a`   | Default data assigned to form.data. Creates a copy which is automatically used for form data in a `useInertiaInput` hook |
| `model`           | `undefined` | The root model for the form. If provided, all get and set operations in nested `useInertiaInput` elements will append the model to the dot notation string |
| `method`          | `'post`   | HTTP method to use for the form |
| `to`              | `undefined` | Path to send the request to when the form is submitted. If this is omitted, submitting the form will do nothing except call `onSubmit` |
| `async`           | `false`     | If true, uses `axios` methods to send form data. If false, uses Inertia's `useForm.submit` method. |
| `remember`        | `true`      | If true, stores form data in local storage using the key `${method}/${model || to}`. If one of `model` or `to` are not defined, data is not persisted |
| `railsAttributes` | `false`     | If true, rewrites nested attributes by appending `'_attributes'` to the key. Getters and setters handle the rewrites for you, which means you don't need to add the `'_attributes'` when dealing with form data |
| `onSubmit`        | `undefined` | Called when the form is submitted, fired just before sending the request. If the method returns `false`, submit is canceled |
| `onChange`        | `undefined` | Called every time the form data changes |
| `onSuccess`       | `undefined` | Called when the form has been successfully submitted |
| `onError`         | `undefined` | Called when an error is set, either manually or by a server response |

Basic example:

```javascript
const user = {
  user: {
    firstName: "Jake",
  }
  userRole: {
    role: 'dog',
  }
}

const PageWithFormOnIt = ({ user }) => {
  return (
    <Form
      model="user"
      data={ { user } }
      to={ `user/${user.id}` }
      method="patch"
    >
      <TextInput name="firstName" label="First Name" />

      <TextInput name="userRole" label="Role" />
    </Form>
  )
}

```

The above component produces the following HTML (assuming the TextInput component is the same as the example from the previous section):

```html
<form>
  <label for="user_firstName">
  <input id="user_firstName" type="text" name="user.firstName" value="Jake" />

  <label for="userRole_role">
  <input id="userRole_role" type="text" name="userRole.role" value="admin" />
</form>
```

The form data object would look as such:

```javascript
{
  user: {
    firstName: "Jake",
    ticket: {
      name: ""
    }
  },
  person_role: {
    role: ""
  }
}
```

When using the `Form` component, the `NestedFields` component becomes available as well. This makes it easy to add nested data which can then optionally be transformed before being submitted to the server. By default, Rails controllers want nested data to have '_attributes' appended to the key, which is also the default for `NestedFields` input data. This can be changed through the `renameNestedAttributes` prop which either accepts `false` to disable attribute renaming, or a function in the form `(attribute: string) => string`.

```javascript
const user = {
  user: {
    firstName: "Jake"
  }
}

const PageWithFormOnIt = ({ user }) => {
  return (
    <Form
      model="user"
      data={ { user } }
      to={ `user/${user.id}` }
      method="patch"
    >
      <TextInput name="firstName" label="First Name" />

      <TextInput name="role" model="person_role" />

      <NestedFields model="ticket">
        <TextInput name="name" label="Ticket Name" />
        <TextInput name="number" label="Ticket Number" />
      </NestedFields>
    </Form>
  )
}
```

With the default Rails behavior of transforming nested attribute names, the server would receive this data in the following form:

```javascript
{
  user: {
    firstName: "Jake",
    ticket_attributes: {
      name: ""
    }
  },
  person_role: {
    role: ""
  }
}
```
