# Introduction

A direct replacement for Inertia.js `useForm` React component which addresses two major shortcomings of the original. Namely, the bug preventing the `transform` method from running on submit, and the lack of support for nested data.

This was developed alongside a Rails project, so the form handling ethos comes directly from that environment. I tried to make it as agnostic as possible, and I believe it can be easily used in a Laravel application, however I've never used Laravel so I can't make any promises.

This package provides three main exports; `useInertiaForm`, `useInertiaInput`, and `Form`.

## useInertiaForm

A direct replacement of `useForm`, `useInertiaForm` provides some quality of life extras to make working with nested data easier. This hook returns a superset of the original return values of `useForm`, meaning it can be swapped in without breaking anything. All of the nested data handlers use the lodash methods `set`, `unset` and `get` to leverage dot-notation object access.

`setData`: If the first argument is not a string, falls back to using the Inertia implementation of `setData` which is a flat object assignment.

```javascript
setData('user.firstName', 'Jake')
setData('user.friends[0]', 'Finn')
/* { 
  user: { 
    firstName: 'Jake',
    friends: ['Finn']
  } 
} */
```

`getData`: Allows looking up nested data using dot-notation.

```javascript
getData('user.firstName')
// 'Jake'
```

`unsetData`: Safely destroy a nested value on the form data ojbect.

```javascript
unsetData('user.friends')
/* { 
  user: { 
    firstName: 'Jake'
  } 
} */
```

`getError`: Allows getting a nested error from the form errors object using dot notation.

## useInertiaInput

Since most projects will define their own set of components to reuse, this hook provides conveniences for interacting with Inertia's form data, and uses standard Rails style defaults.

```javascript
const TextInput = ({ name, model, label }) => {
  const { inputName, inputId, value, setValue, error, /* form */ } = useInertiaInput(name, model)

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
<label for="user.firstName">First Name</label>
<input id="user.firstName" type="text" name="user.firstName" value="">
```

The optional second argument will cause value updates to nest automatically. The above input would manipulate the Inertia form `data` object to be as such:

```javascript
{
  user: {
    firstName: ''
  }
}
```

By adhering to Rails conventions, we can easily deal with form errors returned from the server. the `error` variable returned from the hook will contain any errors for this specific input. The `form` variable is the full form ojbect from Inertia, which can be referenced for other data or errors in the rest of the form.

## &lt;Form&gt;

The `Form` component is also provided so you don't need to create your own. It provides extra functionality to `useInertiaInput`, adhering to standard Rails form defaults. While you *could* use `useInertiaInput` for each input on a page, everything works best when you define custom input components such as in the example above.

When using the `Form` component, the `NestedFields` components becomes available as well. This makes it easy to add nested data which can then optionally be transformed before being submitted to the server. By default, Rails controllers want nested data to have '_attributes' appended to the key, which is also the default for `NestedFields` input data. This can be changed through the `renameNestedAttributes` prop which either accepts `false` to disable attribute renaming, or a function in the form `(attribute: string) => string`.

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

The above component produces the folowing HTML (assuming the TextInput component is the same as the example from the previous section):

```html
<form>
  <label for="user.firstName">
  <input id="user.firstName" type="text" name="user.firstName" value="Jake" />

  <label for="person_role.role">
  <input id="person_role.role" type="text" name="person_role.role" value="" />

  <label for="user.ticket.name">
  <input id="user.ticket.name" type="text" name="user.ticket.name" value="" />
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
