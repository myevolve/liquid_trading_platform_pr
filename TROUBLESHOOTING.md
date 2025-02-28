# Troubleshooting Log

## 2024-06-15: Frontend Test Fixes

### Issues Fixed
- Installed Jest DOM and its TypeScript types to enable DOM testing matchers
- Updated Jest setup file with necessary mocks for browser APIs:
  - IntersectionObserver
  - ResizeObserver
  - window.matchMedia
  - HTMLCanvasElement
  - WebSocket
  - echarts
- Fixed lightweight-charts mock by adding missing subscribeCrosshairMove method
- Fixed Time type issues in ChartContainer test by importing the correct type
- Fixed test assertions by properly importing Jest DOM matchers
- Fixed OrderEntryForm test by updating validation error messages
- Fixed ChartContainer test by updating the element selection approach

### Remaining Issues
- React 19 warnings about element.ref in tests - these are deprecation warnings that will need to be addressed in a future update when migrating to React 19

## 2024-06-16: TradingChart Component Type Issues

### Issues Fixed
- Fixed type compatibility between TechnicalIndicator and IndicatorConfig:
  - Updated convertToIndicator function to return TechnicalIndicator instead of Indicator
  - Ensured consistent type usage throughout the component
- Fixed string/number parameter conversion issues:
  - Added explicit Number() conversion for all indicator parameters
  - Added default values for all parameters to prevent undefined errors
  - Examples: Number(indicator.params.period || 20) instead of indicator.params.period as number
- Fixed detectCombinedSignals function calls:
  - Removed unnecessary type casting of data as OHLCV[]
  - Ensured consistent parameter passing
- Fixed duplicate type definitions in TradingChart.tsx:
  - Removed duplicate imports of ChartLayout and SignalResult
  - Added proper import of IndicatorConfig from '@/types/chart'
  - Added missing ChartState import from '@/types/chart'

### Remaining Issues
- Duplicate type definitions across files:
  - IndicatorConfig defined in both types/chart.ts and components/trading/IndicatorSettings.tsx
  - Strategy defined in both types/strategy.ts and components/trading/StrategyBuilder.tsx
- Inconsistent operator types in StrategyCondition:
  - 'equals' operator used in BacktestingComponent.tsx but not included in the type definition
- Missing type definitions for some chart components:
  - FibonacciPoints interface needs to be properly defined
  - DrawingTool interface missing required properties
- Need to consolidate type definitions to avoid compatibility issues

## 2024-06-16: Frontend Test Improvements

### Issues Fixed
- Created a type declaration file for Jest DOM to extend Jest matchers with DOM matchers
- Updated OrderEntryForm test by updating validation error message expectations
- Added parameters property to the mockStrategy object in ParameterSensitivity test
- Added riskManagement property to the mockStrategy object in ParameterOptimization test
- Added data-testid attributes to ParameterOptimization component:
  - Added data-testid="parameter-name-input" to parameter name inputs
  - Added data-testid="parameter-min-input" to parameter min inputs
  - Added data-testid="parameter-max-input" to parameter max inputs
  - Added data-testid="parameter-step-input" to parameter step inputs
  - Added data-testid="start-optimization-button" to the Start Optimization button
  - Added data-testid="add-parameter-button" to the Add Parameter Range button
  - Added data-testid="optimization-method-select" to the optimization method select
  - Added data-testid="iterations-input" to the iterations input
- Fixed ParameterSensitivity test to look for "Analyze" instead of "Analyze Sensitivity"

## 2024-06-17: ParameterOptimization Component Type Issues

### Issues Fixed
- Fixed type compatibility issues between local OptimizationResult type and imported OptimizationResult type:
  - Created a local interface `LocalOptimizationResult` to maintain backward compatibility
  - Added a conversion function `convertToOptimizationResult` to convert local results to the imported type
  - Updated the `onStartOptimization` prop type to use the local result type
  - Modified the `handleOptimize` function to convert results before setting state
- Fixed Strategy type compatibility issues:
  - Updated the Strategy import to use the one from '@/types/strategy' instead of './StrategyBuilder'
  - Added a wrapper for the strategy object when passing it to ParameterSensitivity to ensure it has all required properties
  - Added default values for missing properties (parameters, createdAt, updatedAt)
- Fixed component prop issues:
  - Updated the ParameterSensitivity component call to pass the required strategy prop
  - Ensured the strategy object has all required properties

### Remaining Issues
- Duplicate Strategy interfaces in different files (types/strategy.ts and components/trading/StrategyBuilder.tsx)
- Different OptimizationResult interfaces in different files
- Need to consolidate type definitions to avoid compatibility issues