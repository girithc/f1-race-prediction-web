'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { Button } from '@/components/ui/button';
import { suggestPitStrategySchema } from '@/lib/schemas';
import type { CircuitMeta } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import type { SuggestPitStrategyOutput } from '@/ai/flows/ai-pit-strategy-advisor';

type AdvisorFormData = z.infer<typeof suggestPitStrategySchema>;

type AdvisorFormProps = {
  circuits: CircuitMeta[];
  onGetAdvice: (data: AdvisorFormData) => Promise<{ success: boolean, data?: SuggestPitStrategyOutput, error?: string}>;
  setAdvice: (advice: SuggestPitStrategyOutput | null) => void;
  setIsLoading: (loading: boolean) => void;
  isLoading: boolean;
};

export function AdvisorForm({ circuits, onGetAdvice, setAdvice, setIsLoading, isLoading }: AdvisorFormProps) {
  const form = useForm<AdvisorFormData>({
    resolver: zodResolver(suggestPitStrategySchema),
    defaultValues: {
      circuitId: circuits[0]?.circuitId,
      gridPosition: 10,
      carPerformanceIndex: 0.5,
      avgTireScore: 1.8,
      round: 12,
    },
  });

  const onSubmit = async (data: AdvisorFormData) => {
    setIsLoading(true);
    setAdvice(null);
    const result = await onGetAdvice(data);
    if (result.success && result.data) {
      setAdvice(result.data);
    }
    // Error toast will be handled on the page component
    setIsLoading(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="circuitId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Circuit</FormLabel>
              <Select onValueChange={(val) => field.onChange(Number(val))} defaultValue={String(field.value)}>
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
        <FormField
          control={form.control}
          name="gridPosition"
          render={({ field }) => (
            <FormItem>
              <div className="flex justify-between">
                <FormLabel>Grid Position</FormLabel>
                <span className="text-sm text-muted-foreground">{field.value}</span>
              </div>
              <FormControl>
                <Slider
                  min={1}
                  max={20}
                  step={1}
                  value={[field.value]}
                  onValueChange={(vals) => field.onChange(vals[0])}
                />
              </FormControl>
            </FormItem>
          )}
        />
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
         <FormField
          control={form.control}
          name="round"
          render={({ field }) => (
            <FormItem>
              <div className="flex justify-between">
                <FormLabel>Race Round</FormLabel>
                <span className="text-sm text-muted-foreground">{field.value}</span>
              </div>
              <FormControl>
                <Slider
                  min={1}
                  max={25}
                  step={1}
                  value={[field.value]}
                  onValueChange={(vals) => field.onChange(vals[0])}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Get AI Strategy
        </Button>
      </form>
    </Form>
  );
}
