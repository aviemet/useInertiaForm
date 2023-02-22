# Introduction

A hook for using Inertia.js forms which is meant to be used as a direct replacement of Inertia's `useForm` hook. It address two issues with the original; [the bug preventing the `transform` method from running on submit](https://github.com/inertiajs/inertia/issues/1131#issuecomment-1278533036), and the lack of support for nested data.

This was developed alongside a Rails project, so the form handling ethos follows Rails conventions, however, I tried to make it as agnostic as possible and I believe it can be easily used in a Laravel application.

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

Safely destroy a nested value on the form data ojbect.

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

This hook must be consumed within the context of the privded `<Form>` component.

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

```javascript
const user = {
  user: {
    firstName: "Jake",
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
      </NestedFields>
    </Form>
  )
}

```

The above component produces the folowing HTML (assuming the TextInput component is the same as the example from the previous section):

```html
<form>
  <label for="user_firstName">
  <input id="user_firstName" type="text" name="user.firstName" value="Jake" />

  <label for="person_role_role">
  <input id="person_role_role" type="text" name="person_role.role" value="" />

  <label for="user_ticket_name">
  <input id="user_ticket_name" type="text" name="user.ticket.name" value="" />
</form>
```

The form data ojbect would look as such:

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
      </NestedFields>
    </Form>
  )
}

```


With the default Rails behavior of transforming nested attribute names, the server would recieve this data in the following form:

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







## Want to publish your Custom Hook to npm?

### 1. Set a secret in an environment variable

The authentication token/credentials have to be made available in the CI service via environment variables. For more information, see "[Authentication for plugins](https://semantic-release.gitbook.io/semantic-release/usage/ci-configuration#authentication-for-plugins)".

### 2. Create Release workflow

```yml
# .github/workflows/release.yml
name: Release
on:
  push:
    branches:
      - "[0-9]+.x"
      - "[0-9]+.[0-9]+.x"
      - master
      - next
      - next-major
      - beta
      - alpha
jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v1
        with:
          node-version: 12.x
      - name: Install dependencies
        run: npm ci
      - name: Lint
        run: |
          npm run lint:types
          npm run lint
      - name: Test
        run: npm test
        env:
          CI: true
      - name: Build
        run: npm run build
      - name: Release
        run: npm run release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### 3. Push a new commit to a `master` branch

```bash
npm run cz
git push origin master
```

## Contributing

Contributions are always welcome! Please read the [contributing](./CONTRIBUTING.md) first.

## Contributors

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center">
      <a href="https://qiita.com/kotarella1110">
        <img src="https://avatars1.githubusercontent.com/u/12913947?v=4" width="100px;" alt=""/><br />
        <sub><b>Kotaro Sugawara</b></sub>
      </a>
      <br />
      <a href="https://github.com/kotarella1110/typescript-react-hooks-starter/commits?author=kotarella1110" title="Code">💻</a>
      <a href="https://github.com/kotarella1110/typescript-react-hooks-starter/commits?author=kotarella1110" title="Documentation">📖</a>
      <a href="#ideas-kotarella1110" title="Ideas, Planning, & Feedback">🤔</a>
      <a href="#infra-kotarella1110" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a>
      <a href="https://github.com/kotarella1110/typescript-react-hooks-starter/commits?author=kotarella1110" title="Tests">⚠️</a>
    </td>
  </tr>
</table>

<!-- markdownlint-enable -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!

## License

[MIT](./LICENSE) © [Kotaro Sugawara](https://twitter.com/kotarella1110)
