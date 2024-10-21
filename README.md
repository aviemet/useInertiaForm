# Introduction

A hook for using forms with Inertia.js, meant to be used as a direct replacement of Inertia's `useForm` hook.

It address two issues with the original: [the bug preventing the `transform` method from running on submit](https://github.com/inertiajs/inertia/issues/1131), and [the lack of support for nested form data](https://github.com/inertiajs/inertia/discussions/1174).

This was developed alongside a Rails project, so the form handling ethos follows Rails conventions, however, effort was taken to make it as agnostic as possible and it should be useable in a Laravel application as well.

## References

### Wiki

I've chosen to keep the main readme clean and only provide basic examples to help get started. 

[More in depth documentation is available on the Wiki section of this repo](https://github.com/aviemet/useInertiaForm/wiki)

### Codesandbox

[Here is a codesandbox with usage examples for all hooks and components](https://codesandbox.io/s/useinertiaform-examples-0so45f)

If you encounter a bug, please try to reacreate it with a fork of the codesandbox below and submit it with the issue. I don't have much time to address issues, so seeing an actual recreation can really help me identifiy if it's something I should look into.

## Quickstart

Below are basic usage examples of the exported members of this project

### [useInertiaForm](https://github.com/aviemet/useInertiaForm/wiki/1.-useInertiaForm)

Drop in replacement for Inertia.js' `useForm`, with support for nested data

```typescript
const { data, setData, getData, unsetData, errors, setError, getError } = useInertiaForm({
  user: {
    firstName: 'Finn'
    lastName: undefined
  }
})

getData('user.firstName')
setData('user.lastName', 'Human')
```

### [Form component](https://github.com/aviemet/useInertiaForm/wiki/2.-Form-component)

Create a custom form component for your project

```typescript
import { Form as InertiaForm, type FormProps, type NestedObject } from 'use-inertia-form'

const Form = <TForm extends NestedObject>(
  { children, railsAttributes = true, className, ...props }: FormProps<TForm>,
) => {
  return (
    <div className="form-wrapper">
      <InertiaForm
        className={ `form ${className}` }
        railsAttributes={ railsAttributes }
        { ...props }
      >
        { children }
      </InertiaForm>
    </div>
  )
}
```

### [useInertiaInput](https://github.com/aviemet/useInertiaForm/wiki/2.1-useInertiaInput)

Create custom inputs for your project

```typescript
import { useInertiaInput } from 'use-inertia-form'

const TextInput = ({ name, model, label }) => {
  const { inputName, inputId, value, setValue, error } = useInertiaInput({ name, model })

  return (
    <label for={ inputId }>{ label }</label>
    <input
      type='text'
      id={ inputId }
      name={ inputName }
      value={ value }
      onChange={ e => setValue(e.target.value) }
    >
    { error && <div className="error">{ error }</div> }
  )
}
```

### [NestedFields](https://github.com/aviemet/useInertiaForm/wiki/2.2-NestedFields)

Helper component for visually specifying nested data lookup context

```typescript
import { NestedFields } from 'use-inertia-form'
import { Form, TextInput } from 'my/project/components'

const user = {
  firstName: 'Finn',
  preferences: {
    princess: 'Bubblegum',
    sword: 'Scarlet'
  }
}

const EditUserForm = () => {
  return (
    <Form model="user" data={ { user } } to={ `users/${user.id}` } method="patch">
      <TextInput name="firstName" label="First Name" />

      {/* Create a nested model context of `form.data.user.preferences` */}
      <NestedFields model="preferences">

        {/* This input would sync to `form.data.user.preferences.princess` */}
        <TextInput name="princess" label="Favorite Princess" />

        {/* And this would sync to `form.data.user.preferences.sword` */}
        <TextInput name="sword" label="Favorite Sword" />

      </NestedFields>
    </Form>
  )
}
```

### [useDynamicInputs](https://github.com/aviemet/useInertiaForm/wiki/2.3-useDynamicInputs)

Build a custom component for handling arrays in nested data object

```typescript
import { useDynamicInputs, NestedFields } from 'use-inertia-form'

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

### [Submit](https://github.com/aviemet/useInertiaForm/wiki/2.4-Submit-component)

Not necessary to use, any submit button in the `<Form>` will cause the form to submit. This component just has a few standard features already built in.

### Putting it all together

You can now use those components together to build forms with nested data support.

```typescript
import { NestedFields, Submit } from 'use-inertia-form'
import { Form, TextInput, DynamicInputs } from 'my/project/components'

// This probably comes from the server
const user = {
  user: {
    id: 1,
    firstName: "Jake",
    email: "jake@thetreehouse.ooo",
    home: {
      name: "The Treehouse",
      location: "Ooo",
    },
    friends: [
      { name: "Finn", email: 'finn@thetreehouse.ooo' },
      { name: "BMO", email: 'bmo@thetreehouse.ooo' },
    ]
  }
}

const EditUserForm = ({ user }) => {
  return (
    <Form 
      model="user"
      data={ { user } }
      to={ `users/${user.id}` }
      method="patch"
      filter="user.id"
    >
      <TextInput name="firstName" label="First Name" />

      <TextInput name="email" label="Email" />

      <NestedFields model="home">
        <TextInput name="name" label="Home Name">
        <TextInput name="location" label="Home Location">
      </NestedFields>

      <DynamicInputs model="friends" emptyData={ {name: ''} } label="Friends">
        <TextInput name="name" label="Name" />
        <TextInput name="email" label="Email" />
      </DynamicInputs>

      <Submit>Update User</Submit>
    </Form>
  )
}
```
