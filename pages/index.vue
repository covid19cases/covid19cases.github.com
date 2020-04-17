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

  // data table card.
  v-card
    v-card-title
      h3 {{ dataTableHead }}
      v-spacer
      v-text-field(
        v-model="tableSearch"
        prepend-inner-icon="mdi-magnify"
        label="Search"
        single-line
        hide-details
        clearable
      )
    v-card-text
      v-data-table(
         :headers="headers"
         :items="cases"
         :items-per-page="perPage"
         :sortBy="sortBy"
         :search="tableSearch"
         sortDesc
      )
        template(v-slot:item.country_region="{ item }")
          a( 
            v-if="item.facet_count > 1"
            @click="selectCountry(item.country_region)"
          ) {{ item.country_region }}
          span( v-else ) {{ item.country_region }}
        // set the number format.
        template(v-slot:item.confirmed="{ item }")
          | {{ numFormater.format(item.confirmed) }}
        template(v-slot:item.new_confirmed="{ item }")
          | {{ numFormater.format(item.new_confirmed) }}
        template(v-slot:item.death="{ item }")
          | {{ numFormater.format(item.death) }}
        template(v-slot:item.new_death="{ item }")
          | {{ numFormater.format(item.new_death) }}
        template(v-slot:item.recovered="{ item }")
          | {{ numFormater.format(item.recovered) }}
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

            dataTableHead: "Cases breakdown by countries", 

            total: {
                confirmed: 0,
                death: 0,
                recovered: 0,
                "new_confirmed": 0,
                "new_death": 0,
                "new_recovered": 0
            },

            // items per page.
            perPage: 15,
            sortBy: ["confirmed"],

            cases: [],

            lastUpdated: null,

            headers: covid.getHeaders(),

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
            filters: []
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

        this.confirmedCount = new CountUp( "confirmedId", this.total.confirmed );
        this.deathCount = new CountUp( "deathId", this.total.death);
        this.recoveredCount = new CountUp( "recoveredId", this.total.recovered);
        //console.log(confirmedCount);
    },

    methods: {

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

            // reset headers.
            self.headers = covid.getHeaders();
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
            // reset cases.
            this.cases = [];
            this.lastUpdated = null;
            // reset count.
            this.confirmedCount.reset();
            this.deathCount.reset();
            this.recoveredCount.reset();

            // reset timer.
            this.timer = this.timerAmount;
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
