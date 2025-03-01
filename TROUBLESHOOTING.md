# Troubleshooting Log

## 2024-06-15: Type Compatibility Issues in ParameterOptimization Component

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

### Issues Identified
- The TradingChart component has multiple type compatibility issues:
  - TechnicalIndicator interface extends BaseTechnicalIndicator which doesn't exist
  - Property 'type' does not exist on type 'TechnicalIndicator'
  - Property 'params' does not exist on type 'TechnicalIndicator'
  - Property 'enabled' does not exist on type 'TechnicalIndicator'
  - Multiple redeclarations of block-scoped variables (chartRef, selectedInterval, etc.)
  - Type compatibility issues between TechnicalIndicator[] and IndicatorConfig[]

### Approach to Fix
1. Create a proper BaseTechnicalIndicator interface
2. Update TechnicalIndicator interface to include missing properties (type, params, enabled)
3. Fix redeclarations by removing duplicate state declarations
4. Create conversion functions between TechnicalIndicator and IndicatorConfig
5. Update function signatures to use the correct types

### Progress
- Created a PR with fixes for the ParameterOptimization component
- Fixed the TechnicalIndicator interface in types/chart.ts:
  - Created a proper BaseTechnicalIndicator interface with common properties
  - Updated TechnicalIndicator interface to include missing properties (type, params, enabled)
  - Added FibonacciPoints interface for the DrawingTool interface
- Updated the StrategyCondition type in types/strategy.ts:
  - Added 'equals' to the operator type
  - Fixed the import for Indicator to use the one from './chart'
- Created a utility file for type conversions:
  - Added functions to convert between TechnicalIndicator and IndicatorConfig
  - Added functions to convert arrays of these types
- Fixed the BacktestingComponent.tsx file:
  - Added type assertions for the 'equals' operator
  - Fixed the calculateIndicatorValue function to return the correct type
  - Fixed the getPreviousValue function to handle the indicator values correctly
- Fixed the signalDetection.ts file:
  - Updated the SignalResult type usage
  - Fixed the detectCombinedSignals function to use the correct indicator property
  - Updated the import for IndicatorConfig to use the one from types/chart.ts instead of IndicatorSettings.tsx
- Fixed redeclarations in TradingChart.tsx:
  - Removed duplicate state declarations (chartRef, selectedInterval, layouts, etc.)
  - Added missing 'visible' property to DrawingTool objects
  - Imported FibonacciPoints from chart types
- Fixed type compatibility issues in TradingChart.tsx:
  - Added proper conversion from TechnicalIndicator[] to IndicatorConfig[] in saveCurrentLayout
  - Added proper conversion for signal detection in useEffect
  - Used the technicalIndicatorsToIndicatorConfigs utility function to ensure type compatibility
  - Updated all calls to detectCombinedSignals to use the technicalIndicatorsToIndicatorConfigs utility function

### Remaining Issues
- Need to consolidate duplicate type definitions
- Update tests to work with the new type definitions

### Lessons Learned
- TypeScript interfaces should be defined in a single location to avoid compatibility issues
- When extending interfaces, make sure the base interface exists
- Use type conversion functions to handle compatibility between similar but different types
- Be careful with optional properties when converting between types (e.g., color property)
- Always provide default values for optional properties when converting between types
- Use utility functions for type conversions to ensure consistency across the codebase
- When importing types, be consistent with the source to avoid compatibility issues

## 2024-06-17: Type Consolidation Plan

### Issues Identified
- Multiple definitions of similar types across different files:
  - `IndicatorConfig` in both `types/chart.ts` and `components/trading/IndicatorSettings.tsx`
  - `Strategy` in both `types/strategy.ts` and `components/trading/StrategyBuilder.tsx`
  - `OptimizationResult` in multiple files
- Inconsistent usage of these types across components
- Redundant interfaces like `Indicator` that extend `TechnicalIndicator` without adding properties

### Approach to Fix
1. Create a unified type system for indicators:
   - Move all indicator types to a single file (`types/indicators.ts`)
   - Deprecate redundant interfaces
   - Document the type hierarchy for better maintainability

2. Standardize Strategy interfaces:
   - Consolidate duplicate Strategy interfaces to `types/strategy.ts`
   - Update imports across the codebase
   - Add proper documentation for the Strategy type

3. Standardize OptimizationResult interfaces:
   - Move all optimization-related types to `types/optimization.ts`
   - Create conversion functions if needed for backward compatibility
   - Update imports across the codebase

### Next Steps
1. Create a new PR for type consolidation
2. Update tests to work with the new type definitions
3. Verify that all components work correctly with the consolidated types
4. Run the CI/CD pipeline to verify that the type issues are resolved
5. Document the type system in the codebase for future reference

## 2024-06-17: ChartLayoutPresets.tsx Update

### Changes Made
- Updated the import for `IndicatorConfig` in `ChartLayoutPresets.tsx` to use the consolidated type from `@/types/indicators` instead of importing from `./IndicatorSettings`

### Issues Encountered
- The component was importing `IndicatorConfig` from `./IndicatorSettings` instead of using the consolidated type from `@/types/indicators`
- This could lead to type compatibility issues if the local type definition differs from the consolidated one

### Lessons Learned
- When consolidating types, it's important to update all imports to use the consolidated types
- Using a consistent source for type imports helps maintain type compatibility across the codebase
- Grep searches are useful for finding all instances of imports that need to be updated

### Next Steps
- Continue checking for other components that might be importing types from local files instead of the consolidated type files
- Verify that the `ChartLayoutPresets` component works correctly with the consolidated types
- Update tests to ensure they work with the new type structure

## 2024-06-17: TradingChart.tsx Update

### Changes Made
- Updated the imports in TradingChart.tsx to use the consolidated types:
  - Imported `TechnicalIndicator`, `IndicatorConfig`, `TimeValuePoint`, and `IndicatorType` from `@/types/indicators`
  - Imported chart-related types from `@/types/chart`
- Fixed the `convertToIndicator` function to use `TechnicalIndicator` instead of `Indicator`:
  - Changed the return type from `Indicator` to `TechnicalIndicator`
  - Removed the unnecessary type assertion `as Indicator`
  - Used the `indicatorConfigToTechnicalIndicator` function directly without casting

### Issues Encountered
- Linter errors related to the `Indicator` type:
  - "Cannot find name 'Indicator'" on lines 576 and 577
  - The `Indicator` type was not defined in the codebase after consolidation
  - The `TechnicalIndicator` type from `@/types/indicators` should be used instead

### Lessons Learned
- When consolidating types, make sure to update all references to the old types
- Check for type assertions that might be hiding type compatibility issues
- Use the TypeScript compiler and linter to identify type issues
- When a type is removed or renamed, search for all references to it in the codebase

### Next Steps
- Continue updating other components to use the consolidated types
- Focus on BacktestingComponent.tsx and ParameterOptimization.tsx next
- Remove duplicate type definitions once all components are updated
- Run tests to verify that all components work correctly with the consolidated types

## 2024-06-17: BacktestingComponent.tsx Type Compatibility Fixes

### Changes Made
- Fixed type compatibility issues in the `BacktestingComponent.tsx` file:
  - Updated the `calculateIndicatorValue` function calls to pass an object with the correct structure
  - Created proper indicator parameter objects with `type` and `params` properties
  - Used the condition's parameter and value to construct the params object
  - Improved the null checking and type checking for indicator values

### Issues Encountered
- The `calculateIndicatorValue` function expected an object with `type` and `params` properties, but was being called with just the indicator type string
- The `StrategyCondition` interface has an `indicator` property of type `IndicatorType` (string), but the function expected an object
- This mismatch was causing TypeScript errors and potential runtime issues

### Lessons Learned
- When working with different type structures, it's important to create proper adapter objects to bridge the gap
- Using more specific types (like `{ type: IndicatorType; params: Record<string, any> }`) instead of just string types helps catch these issues earlier
- Consistent type definitions across the codebase would have prevented this issue in the first place

### Next Steps
- Continue to check for similar type compatibility issues in other components
- Consider refactoring the `StrategyCondition` interface to use a more structured indicator property
- Update tests to ensure they work with the new type structure

## 2024-06-17: ParameterOptimization.tsx Update

### Changes Made
- Updated the imports in ParameterOptimization.tsx to use the consolidated types:
  - Imported `IndicatorType` from `@/types/indicators`
- Modified the parameter extraction logic to work with the new Strategy type:
  - Updated the code that accesses `condition.indicator` to handle the new type structure
  - Added logic to extract parameters from `strategy.parameters` based on indicator type
  - Created a more robust approach to handle the lack of direct access to indicator parameters in the StrategyCondition type

### Issues Encountered
- The `StrategyCondition` interface in `@/types/strategy.ts` has a different structure than expected:
  - The `indicator` property is now just an `IndicatorType` (string union) rather than an object with `type` and `params` properties
  - This required a different approach to extract parameters for optimization
- The parameter extraction logic needed to be updated to work with the consolidated types:
  - Previously, parameters were directly accessed from `condition.indicator.params`
  - Now, parameters need to be inferred from `strategy.parameters` using a naming convention

### Lessons Learned
- When working with string union types like `IndicatorType`, remember that they're just strings and don't have properties
- When consolidating types, it's important to update all code that accesses properties of the old types
- Using a naming convention for parameters (e.g., `SMA-period`) can help with parameter extraction
- It's important to handle the case where parameters might not be available

### Next Steps
- Continue updating other components to use the consolidated types
- Focus on removing duplicate type definitions once all components are updated
- Run tests to verify that all components work correctly with the consolidated types
- Address ESLint configuration issues to resolve the TypeScript version compatibility warnings

## 2024-06-17: ChartLayoutManager.tsx Update

### Changes Made
- Updated the import for `Indicator` to use `TechnicalIndicator` from `@/types/indicators`
- Updated the `ChartLayout` interface to use `TechnicalIndicator` instead of `Indicator`
- Updated the `ChartLayoutManagerProps` interface to use `TechnicalIndicator` in the `onApplyPreset` prop
- Updated the `defaultPresets` to match the `TechnicalIndicator` type:
  - Added required properties (`id`, `name`, `enabled`, `params`) to each indicator
  - Used type assertions for `IndicatorType` values to ensure type safety
  - Renamed `volume` indicator to `sma-volume` to better reflect its type

### Issues Encountered
- Type compatibility issues between string literals and the `IndicatorType` union type
- Missing required properties in the indicator objects in `defaultPresets`
- The `volume` indicator type is not part of the `IndicatorType` union, so had to use `SMA` as a placeholder

### Lessons Learned
- When using union types like `IndicatorType`, type assertions (`as IndicatorType`) can help ensure type safety
- When updating interfaces to use consolidated types, make sure to update all objects that implement those interfaces
- Pay attention to required properties in interfaces to avoid type errors
- When a specific type is not available in a union type, choose a reasonable alternative and document the decision

### Next Steps
- Continue updating other components to use the consolidated types
- Focus on components that import types from `@/types/chart`
- Remove duplicate type definitions once all components are updated
- Run tests to verify that all components work correctly with the consolidated types

## 2024-06-17: IndicatorOverlay.tsx Update

### Changes Made
- Updated the import for `Indicator` to use `TechnicalIndicator` from `@/types/indicators`
- Updated the import for `TimeValuePoint` from `@/types/indicators` instead of `@/utils/indicators`
- Updated the `IndicatorOverlayProps` interface to use `TechnicalIndicator` instead of `Indicator`
- Fixed the `calculateIndicatorValues` function to access parameters through the `params` property:
  - Updated the key generation to use `indicator.params.period` instead of checking if 'period' is in indicator
  - Updated all switch cases to access parameters through `indicator.params` (e.g., `indicator.params.period` instead of `indicator.period`)
- Fixed the result handling to match the return types of the calculation functions:
  - Removed `.value` property access from array elements since the calculation functions return arrays of numbers, not objects with a value property
  - Added fallback values for optional parameters (e.g., `indicator.params.overbought || 80`)
  - Updated the Stochastic indicator to handle both `kPeriod` and `period` parameters

### Issues Encountered
- Type compatibility issues between `Indicator` and `TechnicalIndicator`:
  - The `Indicator` type had properties directly on the object (e.g., `indicator.period`)
  - The `TechnicalIndicator` type has parameters in a `params` object (e.g., `indicator.params.period`)
- Linter errors related to accessing the `value` property on numbers:
  - The calculation functions return arrays of numbers, not objects with a value property
  - This required updating the result handling to access array elements directly
- Parameter naming inconsistencies:
  - Some indicators use different parameter names in different parts of the codebase (e.g., `kPeriod` vs `period` for Stochastic)
  - Added fallbacks to handle these inconsistencies (e.g., `indicator.params.kPeriod || indicator.params.period`)

### Lessons Learned
- When updating types, it's important to check how the properties are accessed throughout the codebase
- The structure of the `TechnicalIndicator` type is more organized with parameters in a `params` object
- When working with calculation functions, it's important to understand their return types
- Adding fallback values for optional parameters helps maintain backward compatibility

### Next Steps
- Continue updating other components to use the consolidated types
- Focus on components that import types from `@/types/chart`
- Remove duplicate type definitions once all components are updated
- Run tests to verify that all components work correctly with the consolidated types
- Address ESLint configuration issues to resolve the TypeScript version compatibility warnings

## 2024-06-17: SignalMarkers.tsx Update

### Changes Made
- Updated the imports to use the consolidated types:
  - Imported `SignalResult` from `@/types/chart` instead of `@/types/indicators`
  - Imported `IndicatorSignal` from `@/types/indicators`
- Modified the `getSignalColor` function to handle both types:
  - Added type checking for `strength` property (number vs string)
  - Implemented different alpha calculations based on the type of strength
- Modified the `getSignalSize` function to handle both types:
  - Added conditional logic to handle numeric and string strength values
  - Implemented different size calculations based on the type of strength
- Added a new `getSignalTime` helper function:
  - Uses type guards to check if the signal has a `time` or `timestamp` property
  - Returns the appropriate time value based on the signal type
  - Provides a fallback value if neither property exists
- Updated the component rendering to use the helper functions:
  - Used `getSignalTime` to extract the time value from either signal type
  - Updated the key generation to use the extracted time
  - Modified the strength display to handle both numeric and string values

### Issues Encountered
- Type compatibility issues between `SignalResult` and `IndicatorSignal`:
  - `SignalResult` uses a `time` property of type `Time`
  - `IndicatorSignal` uses a `timestamp` property of type `number`
  - `SignalResult` has a numeric `strength` property
  - `IndicatorSignal` has a string `strength` property ('strong', 'medium', 'weak')
- Linter errors related to accessing properties that might not exist on both types
- Type assertions were previously used but didn't properly handle the different structures

### Lessons Learned
- When working with union types, use type guards (`in` operator) to check for the existence of properties
- Create helper functions to abstract away type differences and provide a consistent interface
- Handle different property types (number vs string) with conditional logic
- Use TypeScript's type system to ensure type safety when working with different but related types
- Avoid type assertions when possible, as they can hide type compatibility issues

### Next Steps
- Continue updating other components to use the consolidated types
- Focus on components that import types from `@/types/chart`
- Remove duplicate type definitions once all components are updated
- Run tests to verify that all components work correctly with the consolidated types
- Address ESLint configuration issues to resolve the TypeScript version compatibility warnings

## 2024-06-17: ChartContainer.tsx Update

### Changes Made
- Updated the imports to use the consolidated types:
  - Changed the import for `Indicator` to use `TechnicalIndicator` from `@/types/indicators`
  - Kept the import for `OHLCV` from `@/types/chart`
- Updated the `ChartContainerProps` interface to use `TechnicalIndicator` instead of `Indicator`

### Issues Encountered
- No significant issues were encountered during this update
- The change was straightforward as it only required updating the type import and interface

### Lessons Learned
- Simple type replacements (like `Indicator` to `TechnicalIndicator`) can often be done without extensive code changes
- When the structure of the types is similar, the update process is much simpler
- It's important to maintain consistent naming conventions across the codebase

### Next Steps
- Continue updating other components to use the consolidated types
- Focus on components that import types from `@/types/chart`
- Remove duplicate type definitions once all components are updated
- Run tests to verify that all components work correctly with the consolidated types

## 2024-06-17: ChartTooltip.tsx Update

### Changes Made
- Updated the imports to use the consolidated types:
  - Changed the import for `Indicator` to use `TechnicalIndicator` from `@/types/indicators`
  - Kept the import for `Time` from `lightweight-charts`
- Updated the `ChartTooltipProps` interface to use `TechnicalIndicator` instead of `Indicator`

### Issues Encountered
- No significant issues were encountered during this update
- The change was straightforward as it only required updating the type import and interface

### Lessons Learned
- Simple type replacements (like `Indicator` to `TechnicalIndicator`) can often be done without extensive code changes
- When the structure of the types is similar, the update process is much simpler
- It's important to maintain consistent naming conventions across the codebase

### Next Steps
- Continue updating other components to use the consolidated types
- Focus on components that import types from `@/types/chart`
- Remove duplicate type definitions once all components are updated
- Run tests to verify that all components work correctly with the consolidated types

## 2024-06-17: Component Review for Type Consolidation

### Components Reviewed
- TradeList.tsx - No updates needed (only uses Time from lightweight-charts)
- EquityCurveChart.tsx - No updates needed (only uses Time from lightweight-charts)
- PerformanceMetricsChart.tsx - No updates needed (only uses Time from lightweight-charts)
- PerformanceMetricsTooltip.tsx - No updates needed (only uses Time from lightweight-charts)
- OptimizationResultsChart.tsx - No updates needed (uses OptimizationResult from @/types/optimization)

### Analysis
After reviewing the remaining components that import from chart-related modules, we determined that no further updates are needed for the type consolidation effort. These components either:
1. Import the `Time` type directly from `lightweight-charts` (a third-party library)
2. Import types from `@/types/chart` that are still valid after our consolidation
3. Import types from `@/types/optimization` that are already using the consolidated types

### Lessons Learned
- Not all components need to be updated when consolidating types
- Third-party library types (like `Time` from `lightweight-charts`) should be left as is
- It's important to thoroughly review all components that might be affected by type changes
- The re-export of types in `@/types/chart` (e.g., `export type { TechnicalIndicator, IndicatorConfig, TimeValuePoint }`) helps maintain backward compatibility

### Next Steps
1. Remove duplicate type definitions:
   - Remove the `IndicatorConfig` interface from `IndicatorSettings.tsx`
   - Remove the `Strategy` interface from `StrategyBuilder.tsx`
   - Remove any other duplicate type definitions
2. Update tests to work with the new type definitions
3. Verify that all components work correctly with the consolidated types
4. Address ESLint configuration issues to resolve the TypeScript version compatibility warnings
5. Create a PR for type consolidation

## 2024-06-17: StrategyBuilder.tsx Update

### Changes Made
- Removed duplicate `StrategyCondition` and `Strategy` interfaces from StrategyBuilder.tsx
- Updated imports to use the consolidated types:
  - Imported `TechnicalIndicator` and specific indicator types from `@/types/indicators`
  - Imported `Strategy`

## 2024-06-17: TradingChart.tsx Type Compatibility Fix

### Issues Fixed
- Fixed type compatibility issue in TradingChart.tsx when loading chart layouts:
  - The `ChartLayout` interface in ChartLayoutPresets.tsx defines `indicators` as `IndicatorConfig[]`
  - The `setIndicators` function in TradingChart.tsx expects `TechnicalIndicator[]`
  - Used the `indicatorConfigsToTechnicalIndicators` utility function to convert between the types

### Changes Made
- Updated the `handleLayoutSelect` function in TradingChart.tsx to convert `layout.indicators` to `TechnicalIndicator[]` before setting the state
- Removed unused import of `IndicatorConfigPanel` from TradingChart.tsx

### Lessons Learned
- When working with different component interfaces that use similar but different types, always use conversion functions
- The type conversion utilities in `utils/typeConversions.ts` are essential for maintaining compatibility between different parts of the application
- Always check if imported components are actually used in the file

### Next Steps
- Continue to update other components to use the consolidated types
- Check for any other instances where type conversion might be needed
- Update tests to work with the new type definitions

## 2024-06-17: Type Compatibility Issues in Optimization Files

### Issues Identified
- The `services/optimization.ts` and `utils/optimization.ts` files have linter errors related to the `StrategyCondition` type:
  - Property 'params' does not exist on type 'IndicatorType'
  - Property 'type' does not exist on type 'IndicatorType'
  - Spread types may only be created from object types

### Root Cause Analysis
- The `StrategyCondition` interface in `@/types/strategy.ts` has an `indicator` property of type `IndicatorType`, which is a string literal type (like 'RSI', 'MACD', etc.)
- However, the optimization code is trying to access properties like `params` and `type` on this string literal, which doesn't exist
- This suggests that the optimization code was written with a different `StrategyCondition` type in mind, where `indicator` was an object with `params` and `type` properties

### Solution Implemented
- Created a new adapter function in `utils/typeConversions.ts` to handle the conversion between the string-based indicator type and the object structure needed by the optimization code
- Modified the `applyOptimizedParameters` function in both optimization files to use this adapter
- Added proper type checking to ensure type safety
- Documented the approach for future reference

### Lessons Learned
- When consolidating types, it's important to check all usages of the types to ensure compatibility
- String literal types (like `IndicatorType`) cannot have properties accessed on them directly
- When dealing with incompatible type structures, create adapter functions to bridge the gap
- Consider the impact of type changes on all parts of the codebase, especially utility functions that might have assumptions about type structures

## 2024-06-17: Type Compatibility Issues in ConditionBuilder Component

### Issues Fixed
- Fixed type compatibility issues in the ConditionBuilder component:
  - Updated the import to use `StrategyCondition` from `@/types/strategy` instead of `./StrategyBuilder`
  - Updated the import to use `TechnicalIndicator` and `IndicatorType` from `@/types/indicators`
  - Fixed the `handleTypeChange` function to correctly set the indicator property as `IndicatorType`
  - Added a null check for `availableIndicators` to prevent errors when there are no indicators available
  - Ensured the indicator type is properly passed to the `StrategyCondition` object

### Lessons Learned
- When working with TypeScript enums or string literal types like `IndicatorType`, it's important to ensure that values assigned to them are of the correct type
- Using optional chaining (`?.`) and null checks can help prevent runtime errors when working with arrays that might be empty
- When updating component interfaces, it's important to check all usages of the component to ensure compatibility

## 2024-06-17: ESLint TypeScript Version Compatibility Issue

### Issues Identified
- When running `npm run lint`, we encountered the following error:
  ```
  WARNING: You are currently running a version of TypeScript which is not officially supported by @typescript-eslint/typescript-estree.
  
  You may find that it works just fine, or you may not.
  
  SUPPORTED TYPESCRIPT VERSIONS: >=4.3.5 <5.4.0
  
  YOUR TYPESCRIPT VERSION: 5.7.3
  
  Please only submit bug reports when using the officially supported version.
  ```
- Additionally, there was a specific error in the SignalMarkers.tsx file:
  ```
  context.getScope is not a function
  Occurred while linting /home/ubuntu/Cursor_Projects/liquid_trading_platform/frontend/src/components/trading/SignalMarkers.tsx:8
  Rule: "@typescript-eslint/no-unsafe-declaration-merging"
  ```

### Root Cause Analysis
- The project is using TypeScript 5.7.3, which is newer than the version range supported by the current ESLint configuration (>=4.3.5 <5.4.0)
- This version mismatch is causing compatibility issues with the ESLint TypeScript parser
- The specific error in SignalMarkers.tsx is related to the "@typescript-eslint/no-unsafe-declaration-merging" rule, which might not be compatible with the newer TypeScript version

### Potential Solutions
1. Downgrade TypeScript to a version within the supported range (e.g., 5.3.3)
2. Update the ESLint configuration and plugins to versions that support TypeScript 5.7.3
3. Disable the specific rule that's causing issues in the ESLint configuration

### Next Steps
- For now, we'll continue with the type consolidation effort and address the ESLint configuration issues in a separate PR
- We'll document this issue for future reference and include it in the PR description
- We'll recommend updating the ESLint configuration to support the newer TypeScript version

### Lessons Learned
- Always check version compatibility between TypeScript and ESLint plugins
- When upgrading TypeScript, make sure to also update related tools and configurations
- ESLint errors can sometimes be caused by version mismatches rather than actual code issues