<template>
  <div class="container mx-auto flex flex-col items-center bg-gray-100 p-4">
    <app-loader v-if="isLoadingAvailableTickers" />
    <div v-else class="container">
      <div class="w-full my-4"></div>
      <add-ticker @add-ticker="add" :addedTickers="tickers" :availableTickers="availableTickers" />
      <template v-if="tickers.length > 0">
        <hr class="w-full border-t border-gray-600 my-4" />
        <div>
          <button
            class="my-4 mx-2 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            v-if="page > 1"
            @click="setPreviousPage"
          >
            Назад
          </button>
          <button
            class="my-4 mx-2 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            @click="setNextPage"
            v-if="hasNextPage"
          >
            Вперед
          </button>
          <div>Фильтр: <input v-model="filter" /></div>
        </div>
        <hr v-if="paginatedTickers.length > 0" class="w-full border-t border-gray-600 my-4" />
        <dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div
            v-for="ticker in paginatedTickers"
            :key="ticker.name"
            @click="select(ticker)"
            :class="{
              'border-4': selectedTicker === ticker
            }"
            class="bg-white overflow-hidden shadow rounded-lg border-purple-800 border-solid cursor-pointer"
          >
            <div class="px-4 py-5 sm:p-6 text-center">
              <dt class="text-sm font-medium text-gray-500 truncate">{{ ticker.name }} - USD</dt>
              <dd class="mt-1 text-3xl font-semibold text-gray-900">
                {{ formatPrice(ticker.price) }}
              </dd>
            </div>
            <div class="w-full border-t border-gray-200"></div>
            <button
              @click.stop="handleDelete(ticker)"
              class="flex items-center justify-center font-medium w-full bg-gray-100 px-4 py-4 sm:px-6 text-md text-gray-500 hover:text-gray-600 hover:bg-gray-200 hover:opacity-20 transition-all focus:outline-none"
            >
              <svg
                class="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="#718096"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                ></path></svg
              >Удалить
            </button>
          </div>
        </dl>
        <hr v-if="paginatedTickers.length > 0" class="w-full border-t border-gray-600 my-4" />
      </template>
      <section v-if="selectedTicker" class="relative">
        <h3 class="text-lg leading-6 font-medium text-gray-900 my-8">
          {{ selectedTicker.name }} - USD
        </h3>
        <div class="flex items-end border-gray-600 border-b border-l h-64" ref="graph">
          <div
            v-for="(bar, idx) in normalizedGraph"
            :key="idx"
            :style="{ height: `${bar}%` }"
            ref="graphElements"
            class="bg-purple-800 border w-10"
          ></div>
        </div>
        <button @click="selectedTicker = null" type="button" class="absolute top-0 right-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            xmlns:svgjs="http://svgjs.com/svgjs"
            version="1.1"
            width="30"
            height="30"
            x="0"
            y="0"
            viewBox="0 0 511.76 511.76"
            style="enable-background: new 0 0 512 512"
            xml:space="preserve"
          >
            <g>
              <path
                d="M436.896,74.869c-99.84-99.819-262.208-99.819-362.048,0c-99.797,99.819-99.797,262.229,0,362.048    c49.92,49.899,115.477,74.837,181.035,74.837s131.093-24.939,181.013-74.837C536.715,337.099,536.715,174.688,436.896,74.869z     M361.461,331.317c8.341,8.341,8.341,21.824,0,30.165c-4.16,4.16-9.621,6.251-15.083,6.251c-5.461,0-10.923-2.091-15.083-6.251    l-75.413-75.435l-75.392,75.413c-4.181,4.16-9.643,6.251-15.083,6.251c-5.461,0-10.923-2.091-15.083-6.251    c-8.341-8.341-8.341-21.845,0-30.165l75.392-75.413l-75.413-75.413c-8.341-8.341-8.341-21.845,0-30.165    c8.32-8.341,21.824-8.341,30.165,0l75.413,75.413l75.413-75.413c8.341-8.341,21.824-8.341,30.165,0    c8.341,8.32,8.341,21.824,0,30.165l-75.413,75.413L361.461,331.317z"
                fill="#718096"
                data-original="#000000"
              ></path>
            </g>
          </svg>
        </button>
      </section>
    </div>
  </div>
</template>
<script>
import { subscribeToTicker, unsubscribeFromTicker } from './services/subscriberTickersApi';
import { getAvailableTickers } from './services/availableTickersApi.js';
import AddTicker from './components/AddTicker.vue';
import AppLoader from './components/AppLoader.vue';

export default {
  name: 'App',

  components: {
    AddTicker,
    AppLoader
  },

  data() {
    return {
      filter: '',
      missingPriceIndicator: '-',

      tickers: [],
      availableTickers: [],
      isLoadingAvailableTickers: false,

      priceThreshold: 1,
      decimalPlaces: 2,
      significantDigits: 2,
      baseWidthUnit: 4,

      minPercentageGraphLine: 5,
      maxPercentageGraphLine: 100,

      selectedTicker: null,

      graph: [],
      maxGraphElements: 1,

      page: 1,
      maxTickersPerPage: 9
    };
  },

  created() {
    const windowData = Object.fromEntries(new URL(window.location).searchParams.entries());

    const VALID_KEYS = ['filter', 'page'];

    VALID_KEYS.forEach((key) => {
      if (windowData[key]) {
        this[key] = windowData[key];
      }
    });

    const tickersData = localStorage.getItem('cryptonomicon-list');

    if (tickersData) {
      this.tickers = JSON.parse(tickersData);
      this.tickers.forEach((ticker) => {
        subscribeToTicker(ticker.name, (newPrice) => this.updateTicker(ticker.name, newPrice));
      });
    }
  },

  async mounted() {
    this.isLoadingAvailableTickers = true;
    this.availableTickers = await getAvailableTickers();
    this.isLoadingAvailableTickers = false;

    window.addEventListener('resize', this.calculateMaxGraphElements);
  },

  beforeUnmount() {
    window.removeEventListener('resize', this.calculateMaxGraphElements);
  },

  computed: {
    startIndex() {
      return (this.page - 1) * this.maxTickersPerPage;
    },

    endIndex() {
      return this.page * this.maxTickersPerPage;
    },

    filteredTickers() {
      return this.tickers.filter((ticker) =>
        ticker.name.toLowerCase().includes(this.filter.toLowerCase())
      );
    },

    paginatedTickers() {
      return this.filteredTickers.slice(this.startIndex, this.endIndex);
    },

    hasNextPage() {
      return this.filteredTickers.length > this.endIndex;
    },

    normalizedGraph() {
      const maxValue = Math.max(...this.graph);
      const minValue = Math.min(...this.graph);

      if (maxValue === minValue) {
        return this.graph.map(() => this.maxPercentageGraphLine / 2);
      }

      const result = this.graph.map(
        (price) =>
          this.minPercentageGraphLine +
          ((price - minValue) * this.maxPercentageGraphLine - this.minPercentageGraphLine) /
            (maxValue - minValue)
      );

      console.log(result);

      return result;
    },

    pageStateOptions() {
      return {
        filter: this.filter,
        page: this.page
      };
    }
  },

  methods: {
    setPreviousPage() {
      this.page -= 1;
    },

    setNextPage() {
      this.page += 1;
    },

    calculateMaxGraphElements() {
      if (!this.$refs.graph || !this.$refs.graphElements || this.$refs.graphElements.length === 0) {
        return;
      }

      this.trimGraphToMaxSize();

      const firstGraphElement = this.$refs.graphElements[0];
      const widthValue = this.extractNumberFromClass(firstGraphElement.classList, 'w-', '-');
      this.maxGraphElements = this.$refs.graph.clientWidth / (widthValue * this.baseWidthUnit);
    },

    trimGraphToMaxSize() {
      if (this.graph.length > this.maxGraphElements) {
        this.graph = this.graph.slice(this.graph.length - this.maxGraphElements);
      }
    },

    extractNumberFromClass(classList, classPrefix, delimiter) {
      if (!classList?.length) {
        return null;
      }

      for (const className of classList) {
        if (className.startsWith(classPrefix)) {
          const parts = className.split(delimiter);
          if (parts.length > 1) {
            return parts[1];
          }
          return null;
        }
      }

      return null;
    },

    updateTicker(tickerName, price) {
      this.tickers
        .filter((ticker) => ticker.name === tickerName)
        .forEach((ticker) => {
          if (ticker === this.selectedTicker) {
            this.graph.push(price);
            this.trimGraphToMaxSize();
          }
          ticker.price = price;
        });
    },

    formatPrice(price) {
      if (price === null) {
        return this.missingPriceIndicator;
      }

      if (price > this.priceThreshold) {
        return price.toFixed(this.decimalPlaces);
      }

      return price.toPrecision(this.significantDigits);
    },

    async add(ticker) {
      const currentTicker = {
        name: ticker,
        price: null
      };

      this.tickers = [...this.tickers, currentTicker];
      this.filter = '';
      subscribeToTicker(currentTicker.name, (newPrice) =>
        this.updateTicker(currentTicker.name, newPrice)
      );
    },

    select(ticker) {
      this.selectedTicker = ticker;
    },

    handleDelete(tickerToRemove) {
      this.tickers = this.tickers.filter((ticker) => ticker !== tickerToRemove);
      if (this.selectedTicker === tickerToRemove) {
        this.selectedTicker = null;
      }
      unsubscribeFromTicker(tickerToRemove.name);
    }
  },

  watch: {
    selectedTicker() {
      this.graph = [this.maxGraphElements];
      this.$nextTick().then(this.calculateMaxGraphElements);
    },

    tickers() {
      localStorage.setItem('cryptonomicon-list', JSON.stringify(this.tickers));
    },

    paginatedTickers() {
      if (this.paginatedTickers.length === 0 && this.page > 1) {
        this.page -= 1;
      }
    },

    filter() {
      this.page = 1;
    },

    pageStateOptions(value) {
      window.history.pushState(
        null,
        document.title,
        `${window.location.pathname}?filter=${value.filter}&page=${value.page}`
      );
    }
  }
};
</script>
