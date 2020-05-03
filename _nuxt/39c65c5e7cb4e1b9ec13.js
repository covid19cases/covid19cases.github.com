(window.webpackJsonp=window.webpackJsonp||[]).push([[4],{236:function(t,e,r){"use strict";var n=r(237),o=r.n(n);e.default=o.a},237:function(t,e){},249:function(t,e,r){"use strict";r(9),r(4),r(23),r(151),r(55),r(56),r(47);var n=r(66),o=r.n(n),c=r(253),l={baseUrl:"https://dev29983.sites.leocorn.com/solr/covid19_raw/",get searchEndPoint(){return this.baseUrl+"select"},get updateEndPoint(){return this.baseUrl+"update/json/docs?commit=true"},caseCats:["confirmed","death","recovered","new_confirmed","new_death","new_recovered"],pivotField:"country_region",pivotFieldLabel:"Country/Region",getHeaders:function(){return[{text:this.pivotFieldLabel,value:this.pivotField},{text:"Confirmed",value:"confirmed"},{text:"New Confirmed",value:"new_confirmed"},{text:"Deaths",value:"death"},{text:"New Deaths",value:"new_death"},{text:"Recovered",value:"recovered"}]},getCases:function(t,e,r){var n=this,c=(new Date).toISOString().split("T")[0],l=n.buildTotalQuery(t,c);o.a.post(n.searchEndPoint,l).then((function(e){var o=new Date(e.data.response.docs[0]._modified_);t.lastUpdated=o;var c=e.data.facet_counts.facet_pivot;n.loadCasesStats(t,c[n.pivotField]),t.total=n.loadTotalStats(e.data.stats),r&&r()})).catch((function(t){console.log(t)}))},buildTotalQuery:function(t,e){var r=["day:"+e];return t.filters.length>0?(r.push("country_region:"+t.filters[0].value),this.pivotField="province_state",this.pivotFieldLabel="Province/State"):(this.pivotField="country_region",this.pivotFieldLabel="Country/Region"),{query:"*:*",params:{rows:1,start:0,sort:"_modified_ desc",fq:r,stats:"true","stats.field":["{!tag=all3 max=true min=true sum=true}confirmed","{!tag=all3 max=true min=true sum=true}death","{!tag=all3 max=true min=true sum=true}recovered","{!tag=all3 max=true min=true sum=true}new_confirmed","{!tag=all3 max=true min=true sum=true}new_death","{!tag=all3 max=true min=true sum=true}new_recovered"],facet:"true","facet.limit":-1,"facet.pivot":"{!stats=all3}"+this.pivotField}}},loadCasesStats:function(t,e){var r=this;t.cases=e.map((function(t){var e={};return e[r.pivotField]=t.value,e.facet_count=t.count,e.confirmed=t.stats.stats_fields.confirmed.sum,e.death=t.stats.stats_fields.death.sum,e.recovered=t.stats.stats_fields.recovered.sum,e.new_confirmed=t.stats.stats_fields.new_confirmed.sum,e.new_death=t.stats.stats_fields.new_death.sum,e.new_recovered=t.stats.stats_fields.new_recovered.sum,e}))},loadTotalStats:function(t){return{confirmed:t.stats_fields.confirmed.sum,death:t.stats_fields.death.sum,recovered:t.stats_fields.recovered.sum,new_confirmed:t.stats_fields.new_confirmed.sum,new_death:t.stats_fields.new_death.sum,new_recovered:t.stats_fields.new_recovered.sum}},getCasesByDay:function(t,e){var r=this,n="*:*";""!==t.selectedCountry&&void 0!==t.selectedCountry&&(n="country_region:"+t.selectedCountry);var c={query:n,params:{rows:1,start:0,sort:"_modified_ desc",stats:"true","stats.field":["{!tag=all3 max=true min=true sum=true}confirmed","{!tag=all3 max=true min=true sum=true}death","{!tag=all3 max=true min=true sum=true}recovered","{!tag=all3 max=true min=true sum=true}new_confirmed","{!tag=all3 max=true min=true sum=true}new_death","{!tag=all3 max=true min=true sum=true}new_recovered"],facet:"true","facet.limit":-1,"facet.pivot":"{!stats=all3}day"}};o.a.post(r.searchEndPoint,c).then((function(n){var o=new Date(n.data.response.docs[0]._modified_);t.lastUpdated=o;var c=n.data.facet_counts.facet_pivot;t.casesByDay=r.caseCats.map((function(t){return{category:t,stroke:r.getLineStroke(t),numbers:c.day.map((function(e){return{date:new Date(e.value),cases:e.stats.stats_fields[t].sum}}))}})),e&&e()})).catch((function(t){}))},getLineStroke:function(t){var e={color:"black",width:5};switch(t){case"confirmed":case"new_confirmed":e.color="#fb8c00";break;case"death":case"new_death":e.color="#ff5252";break;case"recovered":case"new_recovered":e.color="#4caf50"}return e},initLinesSvg:function(t,e){t.svg=c.l("#"+e).append("svg").attr("width","100%").attr("height",580),t.svgRect=t.svg.node().getBoundingClientRect(),t.chartWidth=t.svgRect.width-t.chartMargin.left-t.chartMargin.right,t.chartHeight=t.svgRect.height-t.chartMargin.top-t.chartMargin.bottom,t.linesGroup=t.svg.append("g").attr("transform","translate("+t.chartMargin.left+","+t.chartMargin.top+")"),t.xRange=c.j().rangeRound([0,t.chartWidth]),t.yRange=c.h().rangeRound([t.chartHeight,0]),t.lineFunc=c.f().x((function(e){return t.xRange(new Date(e.date))})).y((function(e){return t.yRange(+e.cases)}))},setupLinesAxes:function(t,e,r){t.xRange.domain(c.e(e,(function(t){return new Date(t.date)})));var n=c.g(e,(function(t){return+t.cases}));t.yRange.domain([0,n+n/20]);var o=c.a(t.xRange).tickSize(-(t.svgRect.height-t.chartMargin.top-t.chartMargin.bottom),0);if(t.linesGroup.append("g").attr("transform","translate(0,"+t.chartHeight+")").call(o).attr("stroke-opacity","0.25"),r){var l=c.b(t.yRange).tickSize(-(t.svgRect.width-t.chartMargin.right-t.chartMargin.left),0);t.linesGroup.append("g").attr("transform","translate(0,0)").call(l).attr("stroke-opacity","0.25").append("text").attr("fill","#000").attr("transform","rotate(-90)").attr("y",6).attr("x",-55).attr("dy","0.71em").attr("text-anchor","end").text("COVID-19 Cases")}else{var d=c.c(t.yRange).tickSize(-(t.svgRect.width-t.chartMargin.right-t.chartMargin.left),0);t.linesGroup.append("g").attr("transform","translate("+t.chartWidth+",0)").call(d).attr("stroke-opacity","0.25").append("text").attr("fill","#000").attr("transform","rotate(-90)").attr("y",-12).attr("x",-55).attr("dy","0.71em").attr("text-anchor","end").text("COVID-19 Cases")}},drawLinesPath:function(t,data,e,label){var path=t.linesGroup.append("path").datum(data).attr("fill","none").attr("stroke",e.color).attr("stroke-linejoin","miter").attr("stroke-linecap","miter").attr("stroke-width",e.width).attr("d",t.lineFunc),r=path.node().getTotalLength();if(path.attr("stroke-dasharray",r+" "+r).attr("stroke-dashoffset",r).transition().duration(5e3).ease(c.d).attr("stroke-dashoffset",0),label){var n=data[data.length-1];t.linesGroup.append("text").transition().delay(4e3).attr("transform","translate("+t.xRange(new Date(n.date))+","+t.yRange(+n.cases)+")").attr("x",3).attr("dy","0.35em").attr("fill",e.color).style("font","bold 10px sans-serif").text(label)}},drawLineChart:function(t){var e=this;t.selectedCats.includes("confirmed")?e.setupLinesAxes(t,t.casesByDay[0].numbers):t.selectedCats.includes("recovered")?e.setupLinesAxes(t,t.casesByDay[2].numbers):e.setupLinesAxes(t,t.casesByDay[1].numbers),t.casesByDay.forEach((function(r){t.selectedCats.includes(r.category)&&e.drawLinesPath(t,r.numbers,r.stroke)}))},drawMLineChart:function(t){var e=this,r=t.casesByDay.find((function(e){return e.category===t.selectedCat})),n=r.countries.reduce((function(t,e){return t.numbers[t.numbers.length-1].cases>e.numbers[e.numbers.length-1].cases?t:e}));e.setupLinesAxes(t,n.numbers,!1),r.countries.forEach((function(r){e.drawLinesPath(t,r.numbers,r.stroke,r.country)}))},loadCountriesList:function(t){return t.cases.map((function(t){return{text:t.country_region.toUpperCase(),value:t.country_region,count:t.confirmed}})).sort((function(a,b){return b.count-a.count}))},initCountriesList:function(t,e){var r={query:"*:*",params:{rows:1,start:0,sort:"_modified_ desc",fq:"day:"+(new Date).toISOString().split("T")[0],stats:"true","stats.field":["{!tag=all3 sum=true}confirmed"],facet:"true","facet.limit":-1,"facet.pivot":"{!stats=all3}country_region"}};o.a.post(this.searchEndPoint,r).then((function(r){var n=new Date(r.data.response.docs[0]._modified_);t.lastUpdated=n;var o=r.data.facet_counts.facet_pivot;t.allCountries=o.country_region.map((function(t){return{text:t.value,value:t.value,confirmed:t.stats.stats_fields.confirmed.sum}})).sort((function(a,b){return b.confirmed-a.confirmed})),e&&e()})).catch((function(t){console.error("initCountriesList Error:",t)}))},getMultiCasesByDay:function(t,e){var r,n=this,l=["US","Spain","Canada","China"];void 0!==t.selectedCountries&&t.selectedCountries.length>0?l=t.selectedCountries.map((function(t){return t.value})):t.selectedCountries=l.map((function(t){return{text:t,value:t}})),r='country_region:("'+l.join('","')+'")';var d=c.i(c.k);d.domain(l);var m={query:r,params:{rows:1,start:0,sort:"_modified_ desc",stats:"true","stats.field":["{!tag=all3 max=true min=true sum=true}confirmed","{!tag=all3 max=true min=true sum=true}death","{!tag=all3 max=true min=true sum=true}recovered","{!tag=all3 max=true min=true sum=true}new_confirmed","{!tag=all3 max=true min=true sum=true}new_death","{!tag=all3 max=true min=true sum=true}new_recovered"],facet:"true","facet.limit":-1,"facet.pivot":"{!stats=all3}day,country_region"}};o.a.post(n.searchEndPoint,m).then((function(r){var o=new Date(r.data.response.docs[0]._modified_);t.lastUpdated=o;var c=r.data.facet_counts.facet_pivot,m=n.caseCats.map((function(t){return{category:t,numbers:c["day,country_region"].map((function(e){var r={date:new Date(e.value)};return e.pivot.map((function(e){r[e.value]=e.stats.stats_fields[t].sum})),r}))}}));t.casesByDay=m.map((function(t){return{category:t.category,countries:l.map((function(e){return{country:e,stroke:{color:d(e),width:2},numbers:t.numbers.map((function(t){var r=Object.keys(t);return{date:t.date,cases:r.includes(e)?t[e]:0}}))}}))}})),e&&e()})).catch((function(t){console.error("getMultiCasesByDay Error:",t)}))}};e.a=l},250:function(t,e,r){"use strict";var n=r(254),o=r(236),c=r(52),l=r(103),d=r.n(l),m=r(346),f=r(335),v=r(487),h=r(498),component=Object(c.a)(o.default,n.a,n.b,!1,null,null,null);e.default=component.exports,d()(component,{VBtn:m.a,VIcon:f.a,VSpacer:v.a,VToolbar:h.a})},254:function(t,e,r){"use strict";r.d(e,"a",(function(){return n})),r.d(e,"b",(function(){return o}));var n=function(){var t=this.$createElement,e=this._self._c||t;return e("v-toolbar",{staticClass:"mb-2",attrs:{dense:""}},[e("v-spacer"),e("v-btn",{attrs:{icon:"",to:"/",nuxt:"",color:"primary"}},[e("v-icon",[this._v("mdi-table-large")])],1),e("v-btn",{attrs:{icon:"",to:"/lines",nuxt:"",color:"primary"}},[e("v-icon",[this._v("mdi-chart-line")])],1),e("v-btn",{attrs:{icon:"",to:"/mlines",nuxt:"",color:"primary"}},[e("v-icon",[this._v("mdi-chart-multiline")])],1),e("v-spacer")],1)},o=[]},282:function(t,e,r){var content=r(421);"string"==typeof content&&(content=[[t.i,content,""]]),content.locals&&(t.exports=content.locals);(0,r(33).default)("d12b95a4",content,!0,{sourceMap:!1})},420:function(t,e,r){"use strict";var n=r(282);r.n(n).a},421:function(t,e,r){(e=r(32)(!1)).push([t.i,"",""]),t.exports=e},495:function(t,e,r){"use strict";r.r(e);var n=r(253),o=r(249),c=r(279),l={components:{"nav-bar":r(250).default},data:function(){return{pageHead:"COVID-19 Global Cases",lineChartHead:"Global Cases in Line Chart",total:{confirmed:0,death:0,recovered:0,new_confirmed:0,new_death:0,new_recovered:0},lastUpdated:null,currentTime:new Date,numFormater:new Intl.NumberFormat("en-US"),timeFormatter:new Intl.DateTimeFormat("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric",hour:"numeric",minute:"numeric",second:"numeric",hour12:!1,timeZone:"GMT",timeZoneName:"short"}),allCountries:[],selectedCountry:"",filters:[],chartMargin:{top:5,right:60,bottom:30,left:10},cats:[{name:"confirmed",color:"warning"},{name:"death",color:"error"},{name:"recovered",color:"success"}],selectedCats:["confirmed","death","recovered"]}},watch:{selectedCats:function(t){this.drawChart()},selectedCountry:function(t){void 0===t?(this.filters=[],this.pageHead="COVID-19 Global Cases",this.lineChartHead="Global Cases in Line Chart"):(this.filters[0]={name:"country",value:t},this.pageHead="COVID-19 Cases - "+t,this.lineChartHead=t+" Cases in Line Chart"),this.reload()}},created:function(){var t=this;o.a.getCases(this,0,(function(){t.confirmedCount.update(t.total.confirmed),t.deathCount.update(t.total.death),t.recoveredCount.update(t.total.recovered),t.allCountries=o.a.loadCountriesList(t),t.clockInterval>0&&clearInterval(t.clockInterval),t.clockInterval=setInterval((function(){return t.clockTick()}),1e3)}))},beforeDestroyed:function(){clearInterval(this.clockInterval)},mounted:function(){this.drawChart(),this.confirmedCount=new c.a("confirmedId",this.total.confirmed),this.deathCount=new c.a("deathId",this.total.death),this.recoveredCount=new c.a("recoveredId",this.total.recovered)},methods:{drawChart:function(){var t=this;n.m("svg").remove(),o.a.initLinesSvg(this,"linechart"),t.casesByDay?o.a.drawLineChart(t):o.a.getCasesByDay(t,(function(){o.a.drawLineChart(t)}))},reload:function(){var t=this;t.clearData(),o.a.getCases(this,0,(function(){t.confirmedCount.update(t.total.confirmed),t.deathCount.update(t.total.death),t.recoveredCount.update(t.total.recovered),t.timer=t.timerAmount})),t.drawChart()},clearData:function(){var t=this;this.total={confirmed:0,death:0,recovered:0,new_confirmed:0,new_death:0,new_recovered:0},this.lastUpdated=null,this.confirmedCount.reset(),this.deathCount.reset(),this.recoveredCount.reset(),t.clockInterval>0&&clearInterval(t.clockInterval),t.clockInterval=setInterval((function(){return t.clockTick()}),1e3),this.casesByDay=null},clockTick:function(){this.currentTime=new Date},getBreadcrumbs:function(){var t=[{text:"Global Cases",disable:!1,href:"/lines"}];return this.filters.length>0&&t.push({text:this.filters[0].value,disable:!1}),t},valueCompare:function(a,b){return a.count>b.count}}},d=(r(420),r(52)),m=r(103),f=r.n(m),v=r(422),h=r(481),_=r(346),C=r(345),y=r(239),w=r(488),x=r(344),k=r(489),D=r(490),I=r(335),L=r(341),R=r(491),F=r(487),component=Object(d.a)(l,(function(){var t=this,e=t.$createElement,r=t._self._c||e;return r("v-container",{attrs:{"grid-list-xs":""}},[t.filters.length>0?r("v-breadcrumbs",{staticClass:"pa-0",attrs:{items:t.getBreadcrumbs()}}):t._e(),r("h1",{staticClass:"text-center"},[t._v(t._s(t.pageHead))]),r("v-row",[r("v-col",[r("v-chip",{attrs:{label:""}},[t._v(t._s(t.timeFormatter.format(t.currentTime)))])],1),r("v-spacer"),r("v-col",[r("v-chip",{attrs:{label:""}},[t._v("Last updated:"),r("i",{staticClass:"text--primary"},[t._v(t._s(t.timeFormatter.format(t.lastUpdated)))])])],1),r("v-spacer"),r("v-col",{staticClass:"text-right"},[r("v-btn",{staticClass:"ml-2 lighten-4",attrs:{small:"",color:"teal"},on:{click:t.reload}},[r("v-icon",{attrs:{left:""}},[t._v("mdi-reload")]),t._v("Refresh")],1)],1)],1),r("v-progress-linear",{attrs:{value:"100%"}}),r("v-row",[r("v-col",{attrs:{col:"4"}},[r("v-card",{staticClass:"mx-auto",attrs:{color:"warning",shaped:""}},[r("v-card-text",[r("div",[t._v("Confirmed")]),r("p",{staticClass:"display-2 text--primary"},[r("span",{attrs:{id:"confirmedId"}},[t._v(t._s(t.numFormater.format(t.total.confirmed)))])]),r("div",[t._v("New confimed")]),r("div",{staticClass:"display-1 white--text"},[r("span",{attrs:{id:"newConfirmedId"}},[t._v(t._s(t.numFormater.format(t.total.new_confirmed)))])])])],1)],1),r("v-col",{attrs:{col:"4"}},[r("v-card",{staticClass:"mx-auto",attrs:{color:"error",shaped:""}},[r("v-card-text",[r("div",[t._v("Deaths")]),r("p",{staticClass:"display-2 text--primary"},[r("span",{attrs:{id:"deathId"}},[t._v(t._s(t.numFormater.format(t.total.death)))])]),r("div",[t._v("New deaths")]),r("div",{staticClass:"display-1 white--text"},[r("span",{attrs:{id:"newDeathId"}},[t._v(t._s(t.numFormater.format(t.total.new_death)))])])])],1)],1),r("v-col",{attrs:{col:"4"}},[r("v-card",{staticClass:"mx-auto",attrs:{color:"success",shaped:""}},[r("v-card-text",[r("div",[t._v("Recovered")]),r("p",{staticClass:"display-2 text--primary"},[r("span",{attrs:{id:"recoveredId"}},[t._v(t._s(t.numFormater.format(t.total.recovered)))])]),r("div",[t._v("New recovered")]),r("div",{staticClass:"display-1 white--text"},[r("span",{attrs:{id:"newRecoveredId"}},[t._v(t._s(t.numFormater.format(t.total.new_recovered)))])])])],1)],1)],1),r("nav-bar"),r("v-card",[r("v-card-title",[r("h3",[t._v(t._s(t.lineChartHead))]),r("v-spacer"),r("v-autocomplete",{attrs:{label:"Pick a country:",items:t.allCountries,"prepend-icon":"mdi-city",clearable:""},model:{value:t.selectedCountry,callback:function(e){t.selectedCountry=e},expression:"selectedCountry"}})],1),r("v-card-text",[r("v-row",[r("v-col",{attrs:{cols:"2"}},t._l(t.cats,(function(e,n){return r("v-checkbox",{key:n,attrs:{color:e.color,label:e.name.toUpperCase(),value:e.name},model:{value:t.selectedCats,callback:function(e){t.selectedCats=e},expression:"selectedCats"}})})),1),r("v-col",{attrs:{cols:"10"}},[r("div",{attrs:{id:"linechart"}})])],1)],1)],1)],1)}),[],!1,null,null,null);e.default=component.exports;f()(component,{VAutocomplete:v.a,VBreadcrumbs:h.a,VBtn:_.a,VCard:C.a,VCardText:y.a,VCardTitle:y.b,VCheckbox:w.a,VChip:x.a,VCol:k.a,VContainer:D.a,VIcon:I.a,VProgressLinear:L.a,VRow:R.a,VSpacer:F.a})}}]);