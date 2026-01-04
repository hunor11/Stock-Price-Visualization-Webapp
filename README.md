# Stock Price Visualization Webapp

A modern, responsive financial dashboard for visualizing stock market data. This application uses **React**, **Vite**, **Material UI**, and **Lightweight Charts** to provide a professional-grade user experience.

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v16 or higher)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)

### 2. Installation
Navigate to the project folder and install dependencies:

```bash
cd my-app
npm install
```

### 3. API Key Setup
This application uses [Twelve Data](https://twelvedata.com/) to fetch real-time market data.

1.  **Get a Free API Key**: Sign up at [Twelve Data](https://twelvedata.com/) and obtain your API key.
2.  **Configure Environment**:
    *   Navigate to the `my-app` directory.
    *   Create a new file named `.env`.
    *   Add your API key to this file using the `VITE_` prefix:

    ```env
    VITE_TWELVE_DATA_API_KEY=your_actual_api_key_here
    ```

    > **Note**: You can refer to `.env.example` as a template.

### 4. Running the Application
You can start the development server using the provided `Makefile` from the root directory:

```bash
make run-frontend
```

Alternatively, you can run it manually:

```bash
cd my-app
npm run dev
```

Open your browser and visit `http://localhost:5173` (or the URL shown in your terminal).

---

## 📂 Project Modules

This repository is organized into succinct, single-responsibility modules to ensure maintainability and scalability.

### Components (`src/components/`)
*   **`StockWidget.jsx`**: The smart container component. It acts as the "Controller" for the UI, handling:
    *   **State Management**: Search input, time intervals (1D/1W/1M), indicators (SMA/RSI), and zoom ranges.
    *   **Layout**: Orchestrates the Header (Price/Search), Toolbar (Controls), and Footer (Zoom).
    *   **Data Passing**: Fetches data via hooks and passes it down to the chart.
*   **`StockChart.jsx`**: A specialized presentation component responsible for the **Lightweight Charts** canvas.
    *   **Rendering**: Plots Candlesticks and Line series (for indicators).
    *   **Interactivity**: Handles the crosshair movement and the custom **Floating Legend** tooltip.
    *   **Responsiveness**: Uses `ResizeObserver` to adapt to container size changes.

### Hooks (`src/hooks/`)
*   **`useStockHistory.js`**: A custom React Hook that abstracts the data fetching logic.
    *   **API Integration**: Connects to the Twelve Data `time_series` endpoint.
    *   **Reactivity**: Automatically refetches data when the `symbol`, `interval`, or `outputsize` changes.
    *   **Error Handling**: Manages loading states and captures API errors (e.g., rate limits or invalid symbols).

### Utils (`src/utils/`)
*   **`indicators.js`**: Pure utility functions for technical analysis.
    *   **`calculateSMA(data, period)`**: Computes the Simple Moving Average.
    *   **`calculateRSI(data, period)`**: Computes the Relative Strength Index.
    *   *These are calculated client-side to keep the backend interaction simple.*