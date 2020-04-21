<template lang="pug">
v-container( grid-list-xs )
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
        | Refresh in {{ timerFormat(timer) }}

  v-progress-linear( :value="(timerAmount - timer) / timerAmount * 100" )

  // using toolbar for navigation
  nav-bar.mt-2

  // line chart card.
  v-card
    v-card-title
      // search country for more details.
      // use auto-complete component here.
      v-autocomplete(
        v-model="selectedCountries"
        label="Pick countries:"
        :items="allCountries"
        multiple
        @input="selectedCountriesInput = null"
        :search-input.sync="selectedCountriesInput"
        prepend-icon="mdi-city"
        chips
        small-chips
        clearable
      )
        template( v-slot:selection="data" )
          v-chip(
            close
            @click:close="removeCountrySelection(data.item)"
          )
            | {{ data.item.text }}
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

            pageHead: "COVID-19 Cases - Multiple countries in line chart",

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

            // refresh timer, in seconds.
            timerAmount: 120,
            timer: 120,

            // all countries, array of strings
            allCountries: [],
            // selected country.
            selectedCountries: [],

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

        covid.initCountriesList(self, function() {

            //self.allCountries;
            //console.table(self.allCountries);

            // initilize the clock tick.
            if(self.clockInterval)
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

            self.cleanData();

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
        cleanData() {

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
            this.timer = this.timerAmount;

            // reset cases by day.
            this.casesByDay = null;

            // clean clock interval.
            if(this.clockInterval) {

                clearInterval(self.clockInterval);
                self.clockInterval = setInterval( () => self.clockTick(), 1 * 1000 );
            }
        },

        /**
         * handle country select.
         */
        selectCountry( country ) {

            this.filters[0] = {name: "country", value: country};

            // reload data
            this.reload();

            // reset search field.
            this.tableSearch = "";

            // reset page head,
            this.pageHead = "COVID-19 Cases - " + country;
            // reset data table head.
            this.dataTableHead = country + " cases by states";
        },

        /**
         * for each clock tick
         */
        clockTick() {

            // update current time.
            this.currentTime = new Date();

            // count down timer.
            if( this.timer > 0 )
                // count down
                this.timer --;
            else
                // reload page.
                this.reload();
        },

        /**
         * format the given seconds in clock style.
         */
        timerFormat( seconds ) {

            // string padStart will add leading 0
            const mins = (Math.floor(seconds / 60.0) + "").padStart(2, '0');
            const remains = (seconds % 60 + "").padStart(2, '0');
            return mins + ":" + remains;
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
