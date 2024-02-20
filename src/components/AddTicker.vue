<template>
  <section>
    <div class="flex">
      <div class="max-w-xs">
        <label for="wallet" class="block text-sm font-medium text-gray-700">Тикер</label>
        <div class="mt-1 relative rounded-md shadow-md">
          <input
            v-model="ticker"
            @keydown.enter="add"
            type="text"
            name="wallet"
            id="wallet"
            inpu
            class="block w-full pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
            placeholder="Например DOGE"
          />
        </div>
        <div class="flex bg-white shadow-md p-1 rounded-md shadow-md flex-wrap">
          <span
            class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 cursor-pointer"
          >
            BTC
          </span>
          <span
            class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 cursor-pointer"
          >
            DOGE
          </span>
          <span
            class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 cursor-pointer"
          >
            BCH
          </span>
          <span
            class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 cursor-pointer"
          >
            CHD
          </span>
        </div>
        <div v-if="isTickerEntered" class="text-sm text-red-600">Такой тикер уже добавлен</div>
      </div>
    </div>
    <add-button @click="add" type="button" :disabled="disabled" class="my-4" />
  </section>
</template>
<script>
import AddButton from './AddButton.vue'

export default {
  components: {
    AddButton
  },

  props: {
    disabled: {
      type: Boolean,
      required: true,
      default: false
    }
  },

  props: {
    tickers: {
      type: Array,
      required: true,
      default: []
    }
  },

  watch: {
    ticker() {
      this.isTickerEntered = false
    }
  },

  emits: {
    'add-ticker': (value) => typeof value === 'string' && value.length > 0
  },

  data() {
    return {
      ticker: '',
      isTickerEntered: false
    }
  },

  methods: {
    add() {
      if (this.ticker.length === 0) {
        return
      }

      const nameMatch = this.tickers.filter(
        (currentTicker) => currentTicker.name.toLowerCase() === this.ticker.toLowerCase()
      )

      this.isTickerEntered = nameMatch.length != 0

      if (this.isTickerEntered) {
        return
      }

      this.$emit('add-ticker', this.ticker)

      this.ticker = ''
    }
  }
}
</script>
