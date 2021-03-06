<template lang="pug">
v-container( grid-list-xs )
  v-breadcrumbs( 
    v-if="filters.length > 0"
    :items="getBreadcrumbs()"
  ).pa-0
  h1(class="text-center") {{ pageHead }}
  v-row
    v-col
      v-chip(label) {{ timeFormatter.format(currentTime) }}
      //span.text--primary 
    v-spacer
    v-col
      v-chip(label) Last updated:
        i.text--primary {{ timeFormatter.format(lastUpdated) }}
    v-spacer
    v-col.text-right
      v-btn( small color="teal"
        @click="reload"
      ).ml-2.lighten-4
        v-icon(left) mdi-reload
        | Refresh

  v-progress-linear( value="100%" )

  // Summary row!
  v-row
    v-col(col="4")
      v-card( class="mx-auto"
        color="warning"
        shaped
      )
        v-card-text
          div Confirmed
          p.display-2.text--primary
            span(id="confirmedId") {{ numFormater.format(total.confirmed) }}
          div New confimed
          div.display-1.white--text
            span(id="newConfirmedId") {{ numFormater.format(total.new_confirmed) }}
    v-col(col="4")
      v-card( class="mx-auto"
        color="error"
        shaped
      )
        v-card-text
          div Deaths
          p.display-2.text--primary
            span(id="deathId") {{ numFormater.format(total.death) }}
          div New deaths
          div.display-1.white--text
            span(id="newDeathId") {{ numFormater.format(total.new_death) }}
    v-col(col="4")
      v-card( class="mx-auto"
        color="success"
        shaped
      )
        v-card-text
          div Recovered
          p.display-2.text--primary
            span(id="recoveredId") {{ numFormater.format(total.recovered) }}
          div New recovered
          div.display-1.white--text
            span(id="newRecoveredId") {{ numFormater.format(total.new_recovered) }}

  // using toolbar for navigation
  nav-bar

  // line chart card.
  v-card
    v-card-title
      //h3 {{ dataTableHead }}
      h3 {{ lineChartHead }}
      v-spacer
      // search country for more details.
      // use auto-complete component here.
      v-autocomplete(
        v-model="selectedCountry"
        label="Pick a country:"
        :items="allCountries"
        prepend-icon="mdi-city"
        clearable
      )
    v-card-text
      v-row
        v-col( cols="2" )
          v-checkbox(
            v-for="(cat, index) in cats"
            :key="index"
            v-model="selectedCats"
            :color="cat.color"
            :label="cat.name.toUpperCase()"
            :value="cat.name"
          )
        v-col( cols="10" )
          div( id="linechart" )
</template>

<script>

import * as d3 from "d3";

import covid from '@/libs/covid19.js';
import {CountUp} from 'countup.js';

import NavBar from '@/components/nav-bar.vue';

export default {

    //auth: false,
    //layout: default,

    // components.
    components: {
        'nav-bar': NavBar
    },

    // data.
    data() {
        return {

            pageHead: "COVID-19 Global Cases",
            lineChartHead: "Global Cases in Line Chart",

            total: {
                confirmed: 0,
                death: 0,
                recovered: 0,
                "new_confirmed": 0,
                "new_death": 0,
                "new_recovered": 0
            },

            lastUpdated: null,

            currentTime: new Date(),
            numFormater: new Intl.NumberFormat('en-US'),

            // MDN time formatter:
            timeFormatter: new Intl.DateTimeFormat( 'en-US',
                // set options to only show current time.
                {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                    hour: 'numeric', minute: 'numeric', second: 'numeric',
                    // set to 24 hour format.
                    hour12: false,
                    timeZone: 'GMT', timeZoneName: 'short'
                }
            ),

            // all countries, array of strings
            allCountries: [],
            // selected country.
            selectedCountry: '',

            // filters.
            filters: [],

            // properties for line chart.
            chartMargin: {
                top: 5,
                right: 60,
                bottom: 30,
                left: 10
            },
            // TODO: how to decide the height of the char?
            // likely we will use the 100% for what ever width we can get!

            // categories and selected categories.
            cats: [
                {name: "confirmed", color: "warning"},
                {name: "death", color: "error"},
                {name: "recovered", color: "success"}
            ],
            selectedCats: ["confirmed", "death", "recovered"]
        };
    },

    /**
     * watch properties.
     */
    watch: {

        /**
         * draw chart again if selected category chaned
         */
        selectedCats: function(newCats) {

            this.drawChart();
        },

        /**
         * watch the selected country field.
         */
        selectedCountry: function(newCountry) {

            //console.log('new country:', newCountry);
            // selectedCountry is for a clearable autocomplete field.
            // when the clear icon clicked, it will set to undefined.

            if(newCountry === undefined) {
                this.filters = [];
            
                // reset page head,
                this.pageHead = "COVID-19 Global Cases";
                this.lineChartHead = "Global Cases in Line Chart";
            } else {
                this.filters[0] = {name: "country", value: newCountry};
                // reset page head,
                this.pageHead = "COVID-19 Cases - " + newCountry;
                this.lineChartHead = newCountry + " Cases in Line Chart";
            }

            this.reload();
        }
    },

    /**
     */
    created() {

        let self = this;

        covid.getCases(this, 0, function() {

            self.confirmedCount.update(self.total.confirmed);
            self.deathCount.update(self.total.death);
            self.recoveredCount.update(self.total.recovered);

            self.allCountries = covid.loadCountriesList(self);
            //console.table(self.allCountries);

            // initilize the clock tick.
            if(self.clockInterval > 0)
                clearInterval(self.clockInterval);
            self.clockInterval = setInterval( () => self.clockTick(), 1 * 1000 );
        });
    },

    /**
     * before destroyed.
     */
    beforeDestroyed() {

        clearInterval(this.clockInterval);
    },

    mounted() {

        this.drawChart();

        this.confirmedCount = new CountUp( "confirmedId", this.total.confirmed );
        this.deathCount = new CountUp( "deathId", this.total.death);
        this.recoveredCount = new CountUp( "recoveredId", this.total.recovered);
        //console.log(confirmedCount);
    },

    methods: {

        drawChart() {

            let self = this;

            // remove the existing svg
            // welcome only have one SVG element.
            d3.selectAll("svg").remove();
            // initialize the svg for chart.
            covid.initLinesSvg(this, "linechart");

            if(!self.casesByDay) {
                // this is the first time to load this page.
                //  - get the up to date data.
                covid.getCasesByDay(self, function() {

                    covid.drawLineChart(self);
                });
            } else {
                // customer drived change.
                covid.drawLineChart(self);
            }
        },

        reload() {

            let self = this;

            self.clearData();

            covid.getCases(this, 0, function() {

                self.confirmedCount.update(self.total.confirmed);
                self.deathCount.update(self.total.death);
                self.recoveredCount.update(self.total.recovered);

                // reset timer.
                self.timer = self.timerAmount;
            });

            self.drawChart();
        },

        /**
         * Reset page state.
         */
        clearData() {

            let self = this;

            // clean total.
            this.total = {
                confirmed: 0,
                death: 0,
                recovered: 0,
                "new_confirmed": 0,
                "new_death": 0,
                "new_recovered": 0
            }
            this.lastUpdated = null;

            // reset count.
            this.confirmedCount.reset();
            this.deathCount.reset();
            this.recoveredCount.reset();

            // reset timer.
            //this.timer = this.timerAmount;

            // initilize the clock tick.
            if(self.clockInterval > 0)
                clearInterval(self.clockInterval);
            self.clockInterval = setInterval( () => self.clockTick(), 1 * 1000 );

            // reset cases by day.
            this.casesByDay = null;
        },

        /**
         * for each clock tick
         */
        clockTick() {

            // update current time.
            this.currentTime = new Date();
        },

        /**
         * build the bread crumbs.
         */
        getBreadcrumbs( ) {

            let items = [
                {
                    text: "Global Cases",
                    disable: false,
                    href: "/lines"
                }
            ];

            if( this.filters.length > 0 ) {
                items.push({
                    text: this.filters[0].value,
                    disable: false
                });
            }

            return items;
        },

        /**
         * value comparator for autocomplete.
         *
         *    :value-comparator="valueCompare"
         *
         * it only pass the value instead of the object.
         */
        valueCompare(a, b) {

            //console.log("a:", a, "b:", b);
            return a.count > b.count;
        }
    }
}
</script>

<style lang="sass">
.red
  //color: red
</style>
