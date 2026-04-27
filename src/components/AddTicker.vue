<template>
  <section>
    <div class="flex">
      <div class="max-w-xs">
        <label for="wallet" class="block text-sm font-medium text-gray-700">Тикер</label>
        <div class="mt-1 relative rounded-md shadow-md">
          <input
            v-model="inputTickerSymbol"
            @keydown="handleTickerInput"
            @keydown.enter="addTicker"
            type="text"
            name="wallet"
            id="wallet"
            class="block w-full pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
            placeholder="Например DOGE"
          />
        </div>
        <div
          v-if="filteredAvailableTickers.length > 0"
          class="flex bg-white shadow-md p-1 rounded-md shadow-md flex-wrap"
        >
          <span
            v-for="(ticker, idx) in filteredAvailableTickers"
            :key="idx"
            @click="() => handleSuggestionClick(ticker.Symbol)"
            class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 cursor-pointer"
          >
            {{ ticker.Symbol }}
          </span>
        </div>
        <div v-if="showDuplicateError" class="text-sm text-red-600">Такой тикер уже добавлен</div>
      </div>
    </div>
    <add-button
      @click="addTicker"
      :disabled="inputTickerSymbol.length === 0"
      type="button"
      class="my-4"
    />
  </section>
</template>
<script>
import AddButton from './AddButton.vue';

export default {
  components: {
    AddButton
  },
  props: {
    addedTickers: {
      type: Array,
      required: true,
      default() {
        return [];
      }
    },
    availableTickers: {
      type: Array,
      required: true,
      default() {
        return [];
      }
    }
  },
  emits: {
    'add-ticker': (value) => typeof value === 'string' && value.length > 0
  },

  data() {
    return {
      inputTickerSymbol: '',
      showDuplicateError: false,
      maxSuggestionsCount: 4,
      filteredAvailableTickers: []
    };
  },

  watch: {
    inputTickerSymbol(newsTickerSymbol) {
      if (newsTickerSymbol === '') {
        this.filteredAvailableTickers = [];
        return;
      }

      const searchTerm = newsTickerSymbol.toLowerCase();
      this.filteredAvailableTickers = this.availableTickers
        .filter(
          (ticker) =>
            ticker.Symbol.toLowerCase().includes(searchTerm) ||
            ticker.FullName.toLowerCase().includes(searchTerm)
        )
        .slice(0, this.maxSuggestionsCount);
    }
  },

  methods: {
    addTicker() {
      if (this.inputTickerSymbol.length === 0) {
        return;
      }

      if (this.isTickerAlreadyAdded(this.inputTickerSymbol)) {
        this.showDuplicateError = true;
        return;
      }

      this.$emit('add-ticker', this.inputTickerSymbol);
      this.showDuplicateError = false;
      this.inputTickerSymbol = '';
    },

    handleSuggestionClick(selectedTickerSymbol) {
      this.inputTickerSymbol = selectedTickerSymbol;
      this.addTicker();
    },

    isTickerAlreadyAdded(tickerSymbol) {
      return this.addedTickers.some(
        (ticker) => ticker.name.toLowerCase() === tickerSymbol.toLowerCase()
      );
    },

    handleTickerInput() {
      this.showDuplicateError = false;
    }
  }
};
</script>
