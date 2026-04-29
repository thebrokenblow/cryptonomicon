export const getAvailableTickers = async () => {
  const response = await fetch('https://min-api.cryptocompare.com/data/all/coinlist');
  const apiResponse = await response.json();

  const tickersSuggestions = [];
  for (let tickerKey in apiResponse.Data) {
    const rawTicker = apiResponse.Data[tickerKey];
    tickersSuggestions.push({
      Symbol: rawTicker.Symbol,
      FullName: rawTicker.FullName
    });
  }

  return tickersSuggestions;
};
