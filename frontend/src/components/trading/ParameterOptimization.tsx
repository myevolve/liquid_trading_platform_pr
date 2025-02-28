import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import type { Strategy } from '@/types/strategy';
import { OptimizationProgress } from './OptimizationProgress';
import { ParameterSensitivity } from './ParameterSensitivity';
import { 
  type OptimizationMethod,
  type OptimizationConfig,
  getDefaultConfig,
  validateOptimizationConfig,
} from '@/utils/optimization';
import { toast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { validateParameterRanges, formatValidationErrors, type ValidationErrorResult } from '@/utils/validation';
import { OptimizationResultsChart } from './OptimizationResultsChart';
import { OptimizationResult, OptimizationMetrics, ParameterRange as OptimizationParameterRange } from '@/types/optimization';

export interface ParameterRange {
  name: string;
  min: number;
  max: number;
  step: number;
  current: number;
}

// Local result type for backward compatibility
interface LocalOptimizationResult {
  parameters: Record<string, number>;
  metrics: {
    winRate: number;
    profitFactor: number;
    sharpeRatio: number;
    maxDrawdown: number;
  };
}

// Convert local result to imported type
const convertToOptimizationResult = (result: LocalOptimizationResult): OptimizationResult => {
  return {
    parameters: result.parameters,
    metrics: {
      winRate: result.metrics.winRate,
      profitFactor: result.metrics.profitFactor,
      sharpeRatio: result.metrics.sharpeRatio,
      maxDrawdown: result.metrics.maxDrawdown,
      // Add default values for missing metrics
      sortino: 0,
      calmar: 0,
      recoveryFactor: 0,
      profitability: 0
    }
  };
};

interface ParameterOptimizationProps {
  strategy: Strategy;
  onApplyParameters: (parameters: Record<string, number>) => void;
  onStartOptimization: (
    ranges: ParameterRange[],
    config: OptimizationConfig
  ) => Promise<LocalOptimizationResult[]>;
}

export function ParameterOptimization({
  strategy,
  onApplyParameters,
  onStartOptimization,
}: ParameterOptimizationProps) {
  const [ranges, setRanges] = useState<ParameterRange[]>([]);
  const [method, setMethod] = useState<OptimizationMethod>('evolutionary');
  const [config, setConfig] = useState<OptimizationConfig>({
    method: 'evolutionary',
    iterations: 100,
    populationSize: 50,
    mutationRate: 0.1,
    crossoverRate: 0.8,
  });
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentIteration, setCurrentIteration] = useState(0);
  const [bestResult, setBestResult] = useState<OptimizationResult | null>(null);
  const [results, setResults] = useState<OptimizationResult[]>([]);

  // Initialize parameter ranges from strategy
  React.useEffect(() => {
    const newRanges: ParameterRange[] = [];
    
    // Add entry condition parameters
    strategy.entryConditions.forEach(condition => {
      if (condition.indicator?.params) {
        Object.entries(condition.indicator.params).forEach(([name, value]) => {
          if (typeof value === 'number') {
            newRanges.push({
              name: `${condition.indicator!.type}-${name}`,
              min: value * 0.5,
              max: value * 1.5,
              step: value * 0.1,
              current: value,
            });
          }
        });
      }
    });

    // Add risk management parameters
    const riskParams = strategy.riskManagement;
    newRanges.push(
      {
        name: 'maxPositionSize',
        min: riskParams.maxPositionSize * 0.5,
        max: riskParams.maxPositionSize * 1.5,
        step: riskParams.maxPositionSize * 0.1,
        current: riskParams.maxPositionSize,
      },
      {
        name: 'stopLoss',
        min: riskParams.stopLoss * 0.5,
        max: riskParams.stopLoss * 1.5,
        step: riskParams.stopLoss * 0.1,
        current: riskParams.stopLoss,
      },
      {
        name: 'takeProfit',
        min: riskParams.takeProfit * 0.5,
        max: riskParams.takeProfit * 1.5,
        step: riskParams.takeProfit * 0.1,
        current: riskParams.takeProfit,
      }
    );

    setRanges(newRanges);
  }, [strategy]);

  const handleAddRange = () => {
    setRanges([
      ...ranges,
      {
        name: '',
        min: 0,
        max: 100,
        step: 1,
        current: 50,
      },
    ]);
  };

  const handleRangeChange = (index: number, field: keyof ParameterRange, value: string) => {
    const newRanges = [...ranges];
    const numValue = parseFloat(value);
    
    if (field === 'name' || !isNaN(numValue)) {
      newRanges[index] = {
        ...newRanges[index],
        [field]: field === 'name' ? value : numValue,
      };
      setRanges(newRanges);
    }
  };

  const handleMethodChange = (newMethod: OptimizationMethod) => {
    setMethod(newMethod);
    setConfig(prev => ({
      ...prev,
      method: newMethod,
    }));
  };

  const handleConfigChange = (key: keyof OptimizationConfig, value: number) => {
    setConfig(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleOptimize = async () => {
    try {
      setIsOptimizing(true);
      setProgress(0);
      setCurrentIteration(0);
      setBestResult(null);
      setResults([]);

      const localResults = await onStartOptimization(ranges, config);
      const convertedResults = localResults.map(convertToOptimizationResult);
      setResults(convertedResults);

      const best = findBestResult(convertedResults);
      if (best) {
        setBestResult(best);
        handleApplyResult(best);
      }
    } catch (error) {
      console.error('Optimization error:', error);
      toast({
        title: 'Optimization Failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  const findBestResult = (results: OptimizationResult[]): OptimizationResult | undefined => {
    if (results.length === 0) return undefined;

    return results.reduce((best, current) => {
      const getBestScore = (result: OptimizationResult) => {
        const { winRate, profitFactor, sharpeRatio, maxDrawdown } = result.metrics;
        // Weighted scoring based on multiple metrics
        return (
          winRate * 0.3 +
          profitFactor * 0.3 +
          sharpeRatio * 0.2 +
          (1 - maxDrawdown / 100) * 0.2
        );
      };

      return getBestScore(current) > getBestScore(best) ? current : best;
    });
  };

  const handleApplyResult = (result: OptimizationResult) => {
    onApplyParameters(result.parameters);
    toast({
      title: 'Parameters Applied',
      description: 'Optimized parameters have been applied to the strategy.',
    });
  };

  const renderMethodConfig = () => {
    switch (method) {
      case 'evolutionary':
        return (
          <>
            <div className="grid gap-2">
              <Label>Population Size</Label>
              <Input
                type="number"
                min={10}
                value={config.populationSize || 50}
                onChange={(e) => handleConfigChange('populationSize', parseInt(e.target.value))}
              />
            </div>
            <div className="grid gap-2">
              <Label>Mutation Rate</Label>
              <Input
                type="number"
                min={0}
                max={1}
                step={0.1}
                value={config.mutationRate || 0.1}
                onChange={(e) => handleConfigChange('mutationRate', parseFloat(e.target.value))}
              />
            </div>
            <div className="grid gap-2">
              <Label>Crossover Rate</Label>
              <Input
                type="number"
                min={0}
                max={1}
                step={0.1}
                value={config.crossoverRate || 0.8}
                onChange={(e) => handleConfigChange('crossoverRate', parseFloat(e.target.value))}
              />
            </div>
          </>
        );

      case 'particle_swarm':
        return (
          <>
            <div className="grid gap-2">
              <Label>Population Size</Label>
              <Input
                type="number"
                min={10}
                value={config.populationSize || 50}
                onChange={(e) => handleConfigChange('populationSize', parseInt(e.target.value))}
              />
            </div>
            <div className="grid gap-2">
              <Label>Particle Inertia</Label>
              <Input
                type="number"
                min={0}
                max={1}
                step={0.1}
                value={config.particleInertia || 0.7}
                onChange={(e) => handleConfigChange('particleInertia', parseFloat(e.target.value))}
              />
            </div>
            <div className="grid gap-2">
              <Label>Particle Acceleration</Label>
              <Input
                type="number"
                min={0}
                step={0.1}
                value={config.particleAcceleration || 1.5}
                onChange={(e) => handleConfigChange('particleAcceleration', parseFloat(e.target.value))}
              />
            </div>
          </>
        );

      case 'bayesian':
        return (
          <div className="grid gap-2">
            <Label>Exploration Rate</Label>
            <Input
              type="number"
              min={0}
              max={1}
              step={0.1}
              value={config.explorationRate || 0.1}
              onChange={(e) => handleConfigChange('explorationRate', parseFloat(e.target.value))}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Parameter Optimization</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="parameters">
          <TabsList>
            <TabsTrigger value="parameters">Parameters</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
            <TabsTrigger value="sensitivity">Sensitivity</TabsTrigger>
          </TabsList>

          <TabsContent value="parameters">
            <div className="space-y-4">
              <div className="space-y-4">
                {ranges.map((range, index) => (
                  <div key={index} className="grid gap-2">
                    <Label>Parameter Name</Label>
                    <Input
                      value={range.name}
                      onChange={(e) => handleRangeChange(index, 'name', e.target.value)}
                      placeholder="Parameter name"
                      data-testid="parameter-name-input"
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label>Min</Label>
                        <Input
                          type="number"
                          value={range.min}
                          onChange={(e) => handleRangeChange(index, 'min', e.target.value)}
                          data-testid="parameter-min-input"
                        />
                      </div>
                      <div>
                        <Label>Max</Label>
                        <Input
                          type="number"
                          value={range.max}
                          onChange={(e) => handleRangeChange(index, 'max', e.target.value)}
                          data-testid="parameter-max-input"
                        />
                      </div>
                      <div>
                        <Label>Step</Label>
                        <Input
                          type="number"
                          min={0.000001}
                          value={range.step}
                          onChange={(e) => handleRangeChange(index, 'step', e.target.value)}
                          data-testid="parameter-step-input"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <Button onClick={handleAddRange} variant="outline" data-testid="add-parameter-button">
                  Add Parameter Range
                </Button>
              </div>

              <Separator className="my-4" />

              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label>Optimization Method</Label>
                  <Select value={method} onValueChange={handleMethodChange} data-testid="optimization-method-select">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grid">Grid Search</SelectItem>
                      <SelectItem value="random">Random Search</SelectItem>
                      <SelectItem value="bayesian">Bayesian Optimization</SelectItem>
                      <SelectItem value="evolutionary">Evolutionary Algorithm</SelectItem>
                      <SelectItem value="particle_swarm">Particle Swarm</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label>Number of Iterations</Label>
                  <Input
                    type="number"
                    min={1}
                    value={config.iterations}
                    onChange={(e) => handleConfigChange('iterations', parseInt(e.target.value))}
                    data-testid="iterations-input"
                  />
                </div>

                {renderMethodConfig()}
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleOptimize}
                  disabled={isOptimizing || ranges.length === 0}
                  data-testid="start-optimization-button"
                >
                  {isOptimizing ? 'Optimizing...' : 'Start Optimization'}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="results">
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {results.map((result, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">Result #{index + 1}</h4>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-2 mt-2">
                          <div>Win Rate: {result.metrics.winRate.toFixed(2)}%</div>
                          <div>Profit Factor: {result.metrics.profitFactor.toFixed(2)}</div>
                          <div>Sharpe Ratio: {result.metrics.sharpeRatio.toFixed(2)}</div>
                          <div>Max Drawdown: {result.metrics.maxDrawdown.toFixed(2)}%</div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => handleApplyResult(result)}
                      >
                        Apply
                      </Button>
                    </div>
                    <Separator className="my-2" />
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(result.parameters).map(([name, value]) => (
                        <div key={name} className="flex justify-between">
                          <span className="text-sm text-muted-foreground">{name}:</span>
                          <span className="text-sm">{value.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="sensitivity">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                This analysis shows how each parameter correlates with different performance metrics.
                Positive values indicate that increasing the parameter improves the metric, while
                negative values indicate the opposite.
              </p>
              <ParameterSensitivity 
                strategy={{
                  ...strategy,
                  parameters: strategy.parameters || {},
                  createdAt: strategy.createdAt || new Date().toISOString(),
                  updatedAt: strategy.updatedAt || new Date().toISOString()
                }} 
                results={results} 
              />
            </div>
          </TabsContent>
        </Tabs>

        {isOptimizing && (
          <OptimizationProgress
            isOptimizing={isOptimizing}
            progress={progress}
            currentIteration={currentIteration}
            totalIterations={config.iterations}
            bestResult={bestResult}
          />
        )}

        {results.length > 0 && !isOptimizing && (
          <OptimizationResultsChart
            results={results}
            onSelectResult={handleApplyResult}
          />
        )}
      </CardContent>
    </Card>
  );
} 