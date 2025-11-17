'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import { predictRequestSchema } from '@/lib/schemas';
import type { CircuitMeta, WhatIfResponse } from '@/lib/types';
import { getMetadata, whatIf } from '@/lib/api-client';
import { PitStopInput } from '@/components/pit-stop-input';
import { WhatIfGridChart } from '@/components/charts/what-if-grid-chart';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Variable } from 'lucide-react';

type WhatIfFormData = z.infer<typeof predictRequestSchema>;

export default function WhatIfPage() {
  const { toast } = useToast();
  const [circuits, setCircuits] = useState<CircuitMeta[]>([]);
  const [analysis, setAnalysis] = useState<WhatIfResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    getMetadata()
      .then((data) => setCircuits(data.circuits))
      .catch(() => toast({
        variant: "destructive",
        title: "Error fetching metadata",
        description: "Could not load circuit data. Please try again later.",
      }));
  }, [toast]);

  const form = useForm<WhatIfFormData>({
    resolver: zodResolver(predictRequestSchema),
    defaultValues: {
      circuitId: '',
      gridPosition: 10,
      pitPlan: [],
      carPerformanceIndex: 0.5,
      avgTireScore: 1.8,
      round: 12,
    },
  });

  const onSubmit = async (data: WhatIfFormData) => {
    setIsLoading(true);
    setAnalysis(null);
    try {
      const result = await whatIf(data);
      setAnalysis(result);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>What-If Scenario</CardTitle>
          <CardDescription>
            Configure a base scenario to analyze its sensitivity to starting grid position.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="circuitId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Circuit</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a circuit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {circuits.map((c) => (
                          <SelectItem key={c.circuitId} value={String(c.circuitId)}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <PitStopInput control={form.control} />
              
              <FormField
                control={form.control}
                name="carPerformanceIndex"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between">
                      <FormLabel>Car Performance Index</FormLabel>
                      <span className="text-sm text-muted-foreground">{field.value.toFixed(2)}</span>
                    </div>
                    <FormControl>
                      <Slider
                        min={0}
                        max={1}
                        step={0.01}
                        value={[field.value]}
                        onValueChange={(vals) => field.onChange(vals[0])}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="avgTireScore"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between">
                      <FormLabel>Average Tire Score</FormLabel>
                      <span className="text-sm text-muted-foreground">{field.value.toFixed(2)}</span>
                    </div>
                    <FormControl>
                      <Slider
                        min={0}
                        max={3}
                        step={0.05}
                        value={[field.value]}
                        onValueChange={(vals) => field.onChange(vals[0])}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Run Sensitivity Analysis
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="lg:col-span-3">
        {analysis ? (
          <WhatIfGridChart data={analysis.series} />
        ) : (
          <Card className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <CardHeader>
              <CardTitle>Awaiting Analysis</CardTitle>
              <CardDescription>
                {isLoading ? 'Running sensitivity analysis...' : 'Fill out the form to see the results.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              ) : (
                <Variable className="h-12 w-12 text-muted-foreground" />
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
