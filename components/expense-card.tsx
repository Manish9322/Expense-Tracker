"use client"

import { useState } from 'react';
import { Expense } from '@/types';
import { cn, formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { formatCurrency as formatCurrencyFn } from '@/lib/data';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUpdateExpenseAutoAddMutation, useUpdateExpenseIsCheckedMutation } from '@/app/services/api';

interface ExpenseCardProps {
  expense: Expense;
  onToggleCheck: (id: string, checked: boolean) => void;
  onToggleAutoAdd: (id: string, autoAdd: boolean) => void;
  onDelete?: (id: string) => void;
  currency?: string;
}

export function ExpenseCard({
  expense,
  onToggleCheck,
  onToggleAutoAdd,
  onDelete,
  currency = 'USD',
}: ExpenseCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [updateExpenseAutoAdd, { isLoading: isUpdatingAutoAdd }] = useUpdateExpenseAutoAddMutation();
  const [updateExpenseIsChecked, { isLoading: isUpdating }] = useUpdateExpenseIsCheckedMutation();

  // Handler for autoAdd toggle
  const handleAutoAddToggle = async (id: string, autoAdd: boolean) => {
    onToggleAutoAdd(id, autoAdd); // update UI immediately (optional)
    try {
      await updateExpenseAutoAdd({ id, autoAdd }).unwrap();
    } catch (err) {
      // Optionally handle error (e.g., revert UI or show toast)
      // onToggleAutoAdd(id, !autoAdd);
    }
  };

  // Handler for checkbox toggle
  const handleCheckToggle = async (id: string, checked: boolean) => {
    onToggleCheck(id, checked); // update UI immediately
    try {
      await updateExpenseIsChecked({ id, isChecked: checked }).unwrap();
    } catch (err) {
      // Optionally handle error (e.g., revert UI or show toast)
    }
  };


  return (
    <div
      className={cn(
        'relative group p-6 rounded-lg border transition-all duration-200 cursor-pointer',
        expense.isChecked
          ? 'bg-primary/5 border-primary/20'
          : 'bg-card border-border hover:border-primary/20',
        isHovered && 'shadow-md'
      )}
      onClick={() => handleCheckToggle(expense.id, !expense.isChecked)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <Checkbox
            checked={expense.isChecked}
            onCheckedChange={(checked) => {
              if (typeof checked === 'boolean') {
                handleCheckToggle(expense.id, checked); // <-- use handler
              }
            }}
            onClick={(e) => e.stopPropagation()}
            className="h-5 w-5 transition-transform duration-200 data-[state=checked]:scale-110"
          />
          <h3 className={cn(
            'font-medium text-lg transition-colors',
            expense.isChecked && 'text-primary'
          )}>
            {expense.title}
          </h3>
        </div>
        {expense.category && (
          <Badge variant="outline" className="text-xs">
            {expense.category}
          </Badge>
        )}
      </div>

      <div className="flex justify-between items-center mt-2">
        <p className={cn(
          'text-2xl font-semibold transition-colors',
          expense.isChecked ? 'text-primary' : 'text-foreground'
        )}>
          {formatCurrencyFn(expense.amount, currency)}
        </p>
      </div>

      <div className="flex justify-between items-center mt-4 pt-4 border-t">
        <div
          className="flex items-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="text-sm text-muted-foreground">Auto-add</span>
          <Switch
            checked={expense.autoAdd}
            onCheckedChange={(checked) =>
              handleAutoAddToggle(expense.id, checked as boolean)
            }
            className="data-[state=checked]:bg-primary"
            disabled={isUpdatingAutoAdd}
          />
        </div>

        {onDelete && (
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(expense.id);
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}