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
        | Refresh in {{ timerFormat(timer) }}

  v-progress-linear( :value="(timerAmount - timer) / timerAmount * 100" )

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
  v-toolbar( dense ).mb-2
    v-spacer
    v-btn( icon to="/" nuxt )
      v-icon mdi-table-large
    v-btn( icon to="/lines" nuxt )
      v-icon mdi-chart-line
    v-spacer

  // line chart card.
  v-card
    v-card-title
      //h3 {{ dataTableHead }}
      h3 Cases in line chart
      v-spacer
      // search country for more details.
      // use auto-complete component here.
    v-card-text
      v-row
        v-col( cols="10" )
          div( id="linechart" )
        v-col( cols="2" )
          v-checkbox(
            v-for="(cat, index) in cats"
            :key="index"
            v-model="selectedCats"
            :label="cat.toUpperCase()"
            :value="cat"
          )
</template>

<script>

import * as d3 from "d3";

import covid from '@/libs/covid19.js';
import {CountUp} from 'countup.js';

export default {

    //auth: false,
    //layout: default,

    // components.

    // data.
    data() {
        return {

            pageHead: "COVID-19 Global Cases",

            total: {
                confirmed: 0,
                death: 0,
                recovered: 0,
                "new_confirmed": 0,
                "new_death": 0,
                "new_recovered": 0
            },

            //casesByDay: [],

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

            // for data table search.
            tableSearch: '',

            // filters.
            filters: [],

            // properties for line chart.
            chartMargin: {
                top: 5,
                right: 20,
                bottom: 30,
                left: 60
            },
            // TODO: how to decide the height of the char?
            // likely we will use the 100% for what ever width we can get!

            // categories and selected categories.
            cats: ["confirmed", "death", "recovered"],
            selectedCats: ["confirmed", "death", "recovered"]
        };
    },

    /**
     */
    created() {

        let self = this;

        covid.getCases(this, 0, function() {

            self.confirmedCount.update(self.total.confirmed);
            self.deathCount.update(self.total.death);
            self.recoveredCount.update(self.total.recovered);

            setInterval( () => self.clockTick(), 1 * 1000 );
        });
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
            d3.selectAll("svg").remove();
            // initialize the svg for chart.
            covid.initLinesSvg(this, "linechart");

            //if(!self.casesByDay) {
                // this is the first time to load this page.
                //  - get the up to date data.
                covid.getCasesByDay(self, function() {

                    // setup axes based on the biggest cases set.
                    covid.setupLinesAxes(self, self.casesByDay[0].numbers);

                    // draw all lines by default.
                    covid.drawLinesPath(self, self.casesByDay[0].numbers,
                        // TODO: make the stroke more easier to use.
                        {color: "orange", width: 1.5});
                    covid.drawLinesPath(self, self.casesByDay[1].numbers,
                        {color: "red", width: 2});
                    covid.drawLinesPath(self, self.casesByDay[2].numbers,
                        {color: "green", width: 1.5});
                });
            //} else {
                // customer drived change.
            //}
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

        cleanData() {

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
            //this.casesByDay = null;
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
                    href: "/"
                }
            ];

            if( this.filters.length > 0 ) {
                items.push({
                    text: this.filters[0].value,
                    disable: false
                });
            }

            return items;
        }
    }
}
</script>

<style lang="sass">
.red
  //color: red
</style>