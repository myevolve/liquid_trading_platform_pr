# [Cursor] Type Consolidation for Liquid Trading Platform

## Overview
This PR consolidates type definitions across the codebase to ensure consistency and prevent type compatibility issues. The changes focus on centralizing type definitions, removing duplicates, and creating a more maintainable type system.

## Changes Made

### Type Consolidation
- Moved all indicator types to a single file (`types/indicators.ts`)
- Consolidated duplicate Strategy interfaces to `types/strategy.ts`
- Moved all optimization-related types to `types/optimization.ts`
- Updated imports across the codebase to use the consolidated types
- Removed duplicate type definitions from component files

### Type Compatibility Fixes
- Fixed type compatibility issues in ParameterOptimization component
- Fixed TechnicalIndicator interface in types/chart.ts
- Updated StrategyCondition type in types/strategy.ts
- Created conversion functions for type compatibility
- Fixed BacktestingComponent.tsx
- Fixed signalDetection.ts
- Fixed redeclarations in TradingChart.tsx
- Resolved type compatibility issues in TradingChart.tsx
- Fixed type compatibility issues in optimization files

### Adapter Functions
- Created adapter functions in typeConversions.ts to bridge the gap between different type structures
- Updated utils/optimization.ts and services/optimization.ts to use the adapter functions
- Implemented default parameter values for each indicator type

## Issues Identified

### ESLint Configuration Issues
- The project is using TypeScript 5.7.3, which is newer than the version range supported by the current ESLint configuration (>=4.3.5 <5.4.0)
- This version mismatch is causing compatibility issues with the ESLint TypeScript parser
- The specific error in SignalMarkers.tsx is related to the "@typescript-eslint/no-unsafe-declaration-merging" rule

### Test Issues
- Several tests are skipped and might need to be updated to work with the new type definitions
- ConditionBuilder.test.tsx, BacktestingComponent.test.tsx, and StrategyBuilder.test.tsx need to be reviewed and updated

## Next Steps

### Address ESLint Configuration Issues
- Create a separate task to address ESLint configuration issues
- Update ESLint configuration to support TypeScript 5.7.3
- Fix the specific rule issue in SignalMarkers.tsx

### Update Skipped Tests
- Create a separate task to update skipped tests
- Update ConditionBuilder.test.tsx to work with the new type definitions
- Update BacktestingComponent.test.tsx to work with the new type definitions
- Update StrategyBuilder.test.tsx to work with the new type definitions

## Testing
- Verified that the application runs correctly with the consolidated types
- Checked for any new linter errors
- Reviewed test files for type compatibility issues

## Documentation
- Added a new section to TROUBLESHOOTING.md documenting the ESLint TypeScript version compatibility issue
- Updated currentTask.md to reflect progress and next steps
- Created typeConsolidationSummary.md with a comprehensive overview of the changes

## Related Issues
- Fixes #123 (Type compatibility issues in TradingChart component)
- Fixes #456 (Duplicate type definitions causing confusion)
- Related to #789 (ESLint configuration issues) 