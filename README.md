# F1 Race Prediction Web

This is a Next.js frontend application for F1 race predictions.

## Prerequisites

- Node.js
- npm

## Installation

1. Clone the repository.
2. Install dependencies:

```bash
npm install
```

## Running the Application

To run the development server:

```bash
npm run dev
```

The application will be available at http://localhost:9002.

## Building for Production

To build the application for production:

```bash
npm run build
```

To start the production server:

```bash
npm start
```

## Functionalities

The application provides the following core features:

### Dashboard
- **Model Status**: Displays the current health and version of the prediction model.
- **Available Circuits**: Shows the number of circuits available for simulation.
- **Quick Links**: Easy access to prediction, comparison, and strategy tools.

### Race Prediction
- **Scenario Configuration**: Users can configure race scenarios by selecting a circuit, grid position, pit plan, car performance index, and round.
- **Outcome Prediction**: Predicts the finish position (P50, P10-P90 range) and top 3 probability.
- **Visualizations**: Displays position distribution charts and feature impact explanations.

### Strategy Comparison
- **Scenario Comparison**: Allows users to define and compare multiple race strategies (e.g., different pit plans).
- **Optimal Strategy**: Identifies the recommended strategy based on predicted outcomes.
- **Visual Analysis**: Provides charts to visualize the performance differences between strategies.

### In-Race Strategy
- **Real-time Scoring**: Uses an LSTM model to score strategies based on live race data (simulated or actual).
- **History & Future Pits**: Users can input lap history and plan future pit stops to see predicted outcomes.
- **Preset Scenarios**: Includes presets for specific Grand Prix scenarios (e.g., Monaco, Australia, Singapore).

## API Endpoints

The application communicates with a backend server at `https://captivating-emotion-production.up.railway.app`.

### Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/healthz` | Checks the health status of the API. |
| `GET` | `/metadata` | Retrieves metadata, including available circuits. |
| `POST` | `/predict` | Submits a race scenario to get a finish position prediction. |
| `POST` | `/compare` | Submits multiple scenarios to compare their outcomes. |
| `POST` | `/strategy/score` | Scores in-race strategies using historical and future pit data. |
| `GET` | `/introspect` | Introspects the model or service state. |
| `POST` | `/whatif` | Performs "what-if" analysis on prediction scenarios. |
