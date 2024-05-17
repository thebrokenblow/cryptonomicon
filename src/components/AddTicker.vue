<template>
  <section>
    <div class="flex">
      <div class="max-w-xs">
        <label for="wallet" class="block text-sm font-medium text-gray-700">Тикер</label>
        <div class="mt-1 relative rounded-md shadow-md">
          <input
            v-model="ticker"
            @input="isTickerContained = false"
            @keydown.enter="add"
            type="text"
            name="wallet"
            id="wallet"
            class="block w-full pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
            placeholder="Например DOGE"
          />
        </div>
        <div class="flex bg-white shadow-md p-1 rounded-md shadow-md flex-wrap">
          <span
            v-for="autoCompletionTicker in autoCompletionTickers"
            :key="autoCompletionTicker.id"
            @click="addByAutoCompletion(autoCompletionTicker.symbol)"
            class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 cursor-pointer"
          >
            {{ autoCompletionTicker.symbol }}
          </span>
        </div>
        <div v-if="isTickerContained" class="text-sm text-red-600">Такой тикер уже добавлен</div>
      </div>
    </div>
    <add-button @click="add" type="button" class="my-4" />
  </section>
</template>
<script>
import AddButton from './AddButton.vue'
import { getAllTickers } from '../api.js'

export default {
  components: {
    AddButton
  },

  computed: {
    autoCompletionTickers() {
      return this.allTicker
        .filter((currentTicker) => {
          if (this.ticker == '') {
            return false
          }

          let nameTicker = this.ticker.toLocaleLowerCase()

          return (
            currentTicker.symbol.toLocaleLowerCase().includes(nameTicker) ||
            currentTicker.fullName.toLocaleLowerCase().includes(nameTicker)
          )
        })
        .slice(0, 4)
    }
  },

  props: {
    tickers: {
      type: Array,
      required: true,
      default: null
    }
  },

  emits: {
    'add-ticker': (value) => typeof value === 'string' && value.length > 0,
    'hide-spinner': null
  },

  async created() {
    const tickerJson = await getAllTickers()
    for (let item in tickerJson.Data) {
      let symbol = tickerJson.Data[item]
      this.allTicker.push({
        symbol: symbol.Symbol,
        fullName: symbol.FullName
      })
    }

    if (this.allTicker.length > 0) {
      this.$emit('hide-spinner')
    }
  },

  data() {
    return {
      ticker: '',
      isTickerContained: false,
      allTicker: []
    }
  },

  methods: {
    getMatchesByName() {
      const namesTickersMatch = this.tickers.filter(
        (currentTicker) =>
          currentTicker.name.toLocaleLowerCase() === this.ticker.toLocaleLowerCase()
      )

      return namesTickersMatch.length != 0
    },

    addByAutoCompletion(nameTicker) {
      this.ticker = nameTicker
      this.add()
    },

    add() {
      this.isTickerContained = this.getMatchesByName()
      if (this.ticker.length === 0 || this.isTickerContained) {
        return
      }

      this.$emit('add-ticker', this.ticker)

      this.ticker = ''
    }
  }
}
</script>
