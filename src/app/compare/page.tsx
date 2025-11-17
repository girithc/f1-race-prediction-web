'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { predictRequestSchema } from '@/lib/schemas';
import type { CircuitMeta, CompareResponse, CompareScenario } from '@/lib/types';
import { getMetadata, compare } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Trash2, Loader2, BarChart3 } from 'lucide-react';

const scenarioSchema = predictRequestSchema.extend({
  id: z.string().min(1, 'ID is required'),
});
type ScenarioFormData = z.infer<typeof scenarioSchema>;

const formSchema = z.object({
  scenarios: z.array(scenarioSchema).min(2, 'At least two scenarios are required for comparison.'),
});
type CompareFormData = z.infer<typeof formSchema>;

function ScenarioForm({ index, remove }: { index: number, remove: (index: number) => void }) {
  const { control } = useFormContext<CompareFormData>();
  const [circuits, setCircuits] = useState<CircuitMeta[]>([]);

  useEffect(() => {
    getMetadata().then((data) => setCircuits(data.circuits));
  }, []);

  const { fields, append, remove: removePit } = useFieldArray({
    control,
    name: `scenarios.${index}.pitPlan`,
  });

  return (
    <Card>
      <CardHeader className='flex-row items-center justify-between'>
        <div>
          <CardTitle>Scenario {index + 1}</CardTitle>
          <FormField
            control={control}
            name={`scenarios.${index}.id`}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input placeholder="Scenario Name/ID" {...field} className="text-xs h-8 mt-1" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button variant="ghost" size="icon" onClick={() => remove(index)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={control}
          name={`scenarios.${index}.circuitId`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Circuit</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                <FormControl>
                  <SelectTrigger><SelectValue placeholder="Select circuit" /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  {circuits.map((c) => (
                    <SelectItem key={c.circuitId} value={String(c.circuitId)}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={control}
          name={`scenarios.${index}.gridPosition`}
          render={({ field: { onChange, ...field } }) => (
            <FormItem>
              <div className="flex justify-between">
                <FormLabel>Grid Position</FormLabel>
                <span className="text-sm text-muted-foreground">{field.value}</span>
              </div>
              <FormControl>
                <Slider min={1} max={20} step={1} value={[Number(field.value)]} onValueChange={(vals) => onChange(vals[0])} />
              </FormControl>
            </FormItem>
          )}
        />
        
        <div className="space-y-2">
            <div className='flex items-center justify-between'>
                <FormLabel>Pit Plan</FormLabel>
                <Button type="button" variant="ghost" size="sm" onClick={() => append({ lap: 0, durationMs: 23000 })}><PlusCircle className="mr-2 h-4 w-4" />Add Stop</Button>
            </div>
            {fields.map((field, pitIndex) => (
                <div key={field.id} className="flex items-start gap-2">
                    <FormField control={control} name={`scenarios.${index}.pitPlan.${pitIndex}.lap`} render={({ field }) => (<FormItem className="flex-1"><FormControl><Input type="number" placeholder="Lap" {...field} /></FormControl></FormItem>)} />
                    <FormField control={control} name={`scenarios.${index}.pitPlan.${pitIndex}.durationMs`} render={({ field }) => (<FormItem className="flex-1"><FormControl><Input type="number" placeholder="Duration (ms)" {...field} /></FormControl></FormItem>)} />
                    <Button type="button" variant="ghost" size="icon" onClick={() => removePit(pitIndex)} className="shrink-0"><Trash2 className="h-4 w-4" /></Button>
                </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function ComparePage() {
  const { toast } = useToast();
  const [results, setResults] = useState<CompareResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const formMethods = useForm<CompareFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      scenarios: [
        { id: 'Strategy A', circuitId: '', gridPosition: 10, pitPlan: [], carPerformanceIndex: 0.5, avgTireScore: 1.8, round: 12 },
        { id: 'Strategy B', circuitId: '', gridPosition: 10, pitPlan: [], carPerformanceIndex: 0.5, avgTireScore: 1.8, round: 12 },
      ],
    },
  });
  
  const { control, handleSubmit } = formMethods;
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'scenarios',
  });

  const onSubmit = async (data: CompareFormData) => {
    setIsLoading(true);
    setResults(null);
    try {
      const response = await compare({ scenarios: data.scenarios as CompareScenario[] });
      setResults(response);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Comparison Failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormProvider {...formMethods}>
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Compare Strategies</CardTitle>
            <CardDescription>
              Set up at least two scenarios to compare their predicted outcomes and find the optimal strategy.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {fields.map((field, index) => (
                  <ScenarioForm key={field.id} index={index} remove={remove} />
                ))}
              </div>
              <div className="mt-6 flex flex-wrap gap-4">
                <Button type="button" variant="outline" onClick={() => append({ id: `Strategy ${fields.length + 1}`, circuitId: '', gridPosition: 10, pitPlan: [], carPerformanceIndex: 0.5, avgTireScore: 1.8, round: 12 })}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Scenario
                </Button>
                <Button type="submit" disabled={isLoading || fields.length < 2}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BarChart3 className="mr-2 h-4 w-4" />}
                  Compare Scenarios
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        
        {results ? (
           <Card>
            <CardHeader>
                <CardTitle>Comparison Results</CardTitle>
                <CardDescription>Recommended Strategy: <span className='text-accent font-bold'>{results.recommendedScenarioId}</span></CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                 {results.results.map(res => (
                    <Card key={res.scenarioId} className={res.scenarioId === results.recommendedScenarioId ? 'border-accent' : ''}>
                        <CardHeader>
                            <CardTitle>{res.scenarioId}</CardTitle>
                        </CardHeader>
                        <CardContent className='space-y-2 text-sm'>
                            <p><strong>Median Finish:</strong> {res.finishP50.toFixed(2)}</p>
                            <p><strong>Top 3 Probability:</strong> {(res.top3Probability * 100).toFixed(1)}%</p>
                            <p><strong>Robustness Score:</strong> {res.robustnessScore.toFixed(2)}</p>
                            <p><strong>Interval Width:</strong> {res.intervalWidth.toFixed(2)}</p>
                        </CardContent>
                    </Card>
                 ))}
            </CardContent>
           </Card>
        ) : (
          <Card className="flex flex-col items-center justify-center min-h-[200px] text-center">
            <CardHeader>
              <CardTitle>Awaiting Comparison</CardTitle>
              <CardDescription>
                {isLoading ? 'Running simulations...' : 'Configure and compare scenarios to see results.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              ) : (
                <BarChart3 className="h-12 w-12 text-muted-foreground" />
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </FormProvider>
  );
}
