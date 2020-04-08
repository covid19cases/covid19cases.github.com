/**
 * configuration for Nuxt.js
 */
export default {

    // set to Single Page application mode.
    mode: 'spa',

    server: {
        //port: 80, // default is 3000
        port: 3003,
        host: '0.0.0.0' // default is localhost
    },

    buildModules: [
        // load the nuxtjs vutify-module
        // https://github.com/nuxt-community/vuetify-module
        '@nuxtjs/vuetify',
        // Axios module.
        '@nuxtjs/axios',
        // Auth module.
        //'@nuxtjs/auth'
    ],

  
    /**
     * Nuxt.js modules
     */

    modules: [
        // Doc: https://axios.nuxtjs.org/usage
        '@nuxtjs/axios'
    ],

    router: {
        // tweak the base, if we plan to deploy on a subfolder
        // /demo/nuxt
        base: '/',

        // enable the middleware
        //middleware: ['auth']
    },

    /**
     * options to set up vuetify, details on page
     *  - https://github.com/nuxt-community/vuetify-module
     */
    vuetify: {

        // we could set up default assets here.
        // By default, automatically handle Roboto font & Material Design Icons
    }
}
