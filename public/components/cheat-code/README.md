# &lt;cheat-code&gt;

> A simple polymer element to recognize cheat codes

## Demo

[Check it live!](http://iamolivinius.github.io/cheat-code)

## Install

Install the component using [Bower](http://bower.io/):

```sh
$ bower install cheat-code --save
```

Or [download as ZIP](https://github.com/iamolivinius/cheat-code/archive/master.zip).

## Usage

1. Import Web Components' polyfill:

    ```html
    <script src="bower_components/platform/platform.js"></script>
    ```

2. Import Custom Element:

    ```html
    <link rel="import" href="bower_components/cheat-code/dist/cheat-code.html">
    ```

3. Start using it!

    ```html
    <cheat-code></cheat-code> <!-- default Konami code -->
    ```
    or
    ```html
    <cheat-code pattern="[65,66,65,67,65,66,66]"></cheat-code> <!-- custom code: abacabb  -->
    ```

## Options

Attribute     | Options     | Default      | Description
---           | ---         | ---          | ---
`pattern`     | *string*    | `[38, 38, 40, 40, 37, 39, 37, 39, 65, 66]`    | Konami Code.

## Events

Event         | Description
---           | ---
`recognized`  | Triggers when a cheat code is recognized.

## Development

In order to run it locally you'll need to fetch some dependencies and a basic server setup.

* Install [Bower](http://bower.io/) & [Grunt](http://gruntjs.com/):

    ```sh
    $ [sudo] npm install -g bower grunt-cli
    ```

* Install local dependencies:

    ```sh
    $ bower install && npm install
    ```

* To test your project, start the development server and open `http://localhost:8000`.

    ```sh
    $ grunt server
    ```

* To build the distribution files before releasing a new version.

    ```sh
    $ grunt build
    ```

* To provide a live demo, send everything to `gh-pages` branch.

    ```sh
    $ grunt deploy
    ```

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## History

For detailed changelog, check [Releases](https://github.com/iamolivinius/cheat-code/releases).

## License

[MIT License](http://opensource.org/licenses/MIT)
