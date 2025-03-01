# Current Task: Type Consolidation in Liquid Trading Platform

## Background
We are working on consolidating type definitions across the codebase to ensure consistency and prevent type compatibility issues. This involves moving duplicate type definitions to centralized type files and updating imports across the codebase.

## Progress
- [x] Fixed type compatibility issues in ParameterOptimization component
- [x] Fixed TechnicalIndicator interface in types/chart.ts
- [x] Updated StrategyCondition type in types/strategy.ts
- [x] Created conversion functions for type compatibility
- [x] Fixed BacktestingComponent.tsx
- [x] Fixed signalDetection.ts
- [x] Fixed redeclarations in TradingChart.tsx
- [x] Resolved type compatibility issues in TradingChart.tsx
- [x] Created a type consolidation plan
- [x] Updated ChartLayoutPresets.tsx to use consolidated types
- [x] Updated TradingChart.tsx to use consolidated types
- [x] Updated BacktestingComponent.tsx to use consolidated types
- [x] Updated ParameterOptimization.tsx to use consolidated types
- [x] Updated ChartLayoutManager.tsx to use consolidated types
- [x] Updated IndicatorOverlay.tsx to use consolidated types
- [x] Updated SignalMarkers.tsx to use consolidated types
- [x] Updated ChartContainer.tsx to use consolidated types
- [x] Updated ChartTooltip.tsx to use consolidated types
- [x] Reviewed remaining components for type consolidation
- [x] Updated StrategyBuilder.tsx to remove duplicate types
- [x] Fixed type compatibility issues in optimization files:
  - [x] Created adapter functions in typeConversions.ts
  - [x] Updated utils/optimization.ts to use the adapter
  - [x] Updated services/optimization.ts to use the adapter
- [x] Run the application to verify that all components work correctly with the consolidated types
- [x] Identified ESLint configuration issues related to TypeScript version compatibility
- [x] Reviewed test files for type compatibility issues

## Next Steps
- [ ] Create a PR for type consolidation
- [ ] Create a separate task to address ESLint configuration issues:
  - [ ] Update ESLint configuration to support TypeScript 5.7.3
  - [ ] Fix the specific rule issue in SignalMarkers.tsx
- [ ] Create a separate task to update skipped tests:
  - [ ] Update ConditionBuilder.test.tsx to work with the new type definitions
  - [ ] Update BacktestingComponent.test.tsx to work with the new type definitions
  - [ ] Update StrategyBuilder.test.tsx to work with the new type definitions

## Approach
1. For the optimization files, we created adapter functions to bridge the gap between the string-based IndicatorType in StrategyCondition and the object structure expected by the optimization code.
2. Instead of modifying the indicator property (which is a string), we update the strategy parameters to store the optimized values.
3. We use default parameter values for each indicator type to ensure the optimization code has access to the necessary parameters.
4. We've verified that the application runs correctly with the consolidated types, but we've identified an ESLint configuration issue that needs to be addressed separately.
5. The test files are already using the consolidated types, but there are some skipped tests that might need to be updated to work with the new type definitions. We'll address these in a separate task.

## Lessons Learned
- When consolidating types, it's important to check all usages of the types to ensure compatibility
- String literal types (like `IndicatorType`) cannot have properties accessed on them directly
- When dealing with incompatible type structures, create adapter functions to bridge the gap
- Consider the impact of type changes on all parts of the codebase, especially utility functions that might have assumptions about type structures
- Always check version compatibility between TypeScript and ESLint plugins
- When upgrading TypeScript, make sure to also update related tools and configurations

## Type Consolidation Plan
We've created a detailed plan for consolidating duplicate type definitions in the project. The plan is documented in `cline_docs/typeConsolidationPlan.md` and includes:

1. Create a unified type system for indicators:
   - Move all indicator types to a single file (`types/indicators.ts`)
   - Deprecate redundant interfaces
   - Document the type hierarchy for better maintainability

2. Standardize Strategy interfaces:
   - Consolidate duplicate Strategy interfaces to `types/strategy.ts`
   - Update imports across the codebase
   - Add proper documentation for the Strategy type

3. Standardize OptimizationResult interfaces:
   - Move all optimization-related types to `types/optimization.ts`)
   - Create conversion functions if needed for backward compatibility
   - Update imports across the codebase

## Issues to Address
- The `services/optimization.ts` and `utils/optimization.ts` files import `Strategy` and `StrategyCondition` from `@/components/trading/StrategyBuilder` instead of using the consolidated types from `@/types/strategy`.
- The `StrategyCondition` type in `@/types/strategy` has an `indicator` property of type `IndicatorType`, which is a string literal type, but the code is trying to access properties like `params` and `type` on it.
- This is a more complex issue that requires a deeper refactoring of the optimization code to work with the consolidated types.

## Notes
- The ESLint configuration appears to be using an older format. We should consider updating it to the new format (eslint.config.js) in a separate task.
- Some components may require additional adjustments to work with the consolidated types, especially if they were relying on specific properties of the duplicate types.

## Dependencies
- Understanding of the existing type system
- Knowledge of TypeScript interfaces and type compatibility
- Familiarity with the codebase and its dependencies 