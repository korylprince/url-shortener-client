# About

This is the frontend for a URL shortening service. The backend can be found [here](https://github.com/korylprince/url-shortener-server).

# Features

* URL Shortener
* Configurable Expiration
* View Counter
* Authentication
* Random or Custom URLs
* URL Search
* Admin Interface
* Custom App Title

# Get Started

Clone this repo:

`git clone https://github.com/korylprince/url-shortener-client.git`

Install packages:

`npm install`

Start developing:

`npm run dev` or `npm run dev-server`

Building for production:

`npm run build-prod`

# Variables

Set `API_BASE` to set a custom URL. This defaults to `/api/1.1`.

Set `APP_TITLE` to set a custom app title. If not set, it will query the api `API_BASE/title` to set a title. If that title is empty, it uses "URL Shortener".

# Uses

* Vue: [vue](https://vuejs.org/)
* Material Design app components: [vue-material](https://vuematerial.io/)
* Calendar component: [v-calendar](https://vcalendar.io/)
* router: [vue-router](https://router.vuejs.org/en/)
* store: [vuex](https://vuex.vuejs.org/en/)
* validation: [vee-validate](http://vee-validate.logaretm.com/)
* HTTP calls: [axios](https://github.com/axios/axios)
* Webpack 2/Babel dev/prod build setup
* Linting with ESLint

# License

MIT (see included `LICENSE`)
