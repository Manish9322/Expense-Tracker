"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { initialExpenses, expenseCategories } from '@/lib/data';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid, AreaChart, Area, RadialBarChart, RadialBar, ComposedChart } from 'recharts';
import { useState } from 'react';
import { CalendarIcon, Filter, X } from 'lucide-react';
import { formatDate } from '@/lib/utils';

// Prepare data for charts
const categoryData = expenseCategories.map(category => {
  const total = initialExpenses
    .filter(expense => expense.category === category)
    .reduce((sum, expense) => sum + expense.amount, 0);
  
  return {
    name: category,
    value: total,
  };
}).filter(item => item.value > 0);

// Create weekly data (simulated)
const weeklyData = [
  { name: 'Mon', amount: 25, budget: 30, savings: 5 },
  { name: 'Tue', amount: 32, budget: 30, savings: -2 },
  { name: 'Wed', amount: 18, budget: 30, savings: 12 },
  { name: 'Thu', amount: 40, budget: 30, savings: -10 },
  { name: 'Fri', amount: 65, budget: 30, savings: -35 },
  { name: 'Sat', amount: 48, budget: 30, savings: -18 },
  { name: 'Sun', amount: 22, budget: 30, savings: 8 },
];

// Create monthly data (simulated)
const monthlyData = [
  { name: 'Jan', amount: 450, average: 420, budget: 500, income: 2000 },
  { name: 'Feb', amount: 380, average: 420, budget: 500, income: 2000 },
  { name: 'Mar', amount: 520, average: 420, budget: 500, income: 2000 },
  { name: 'Apr', amount: 410, average: 420, budget: 500, income: 2000 },
  { name: 'May', amount: 390, average: 420, budget: 500, income: 2000 },
  { name: 'Jun', amount: 480, average: 420, budget: 500, income: 2000 },
];

// Create category trends data (simulated)
const categoryTrendsData = [
  { month: 'Jan', Food: 150, Transport: 100, Entertainment: 80, Shopping: 120, Health: 60 },
  { month: 'Feb', Food: 130, Transport: 90, Entertainment: 100, Shopping: 60, Health: 70 },
  { month: 'Mar', Food: 180, Transport: 110, Entertainment: 70, Shopping: 160, Health: 55 },
  { month: 'Apr', Food: 140, Transport: 95, Entertainment: 90, Shopping: 85, Health: 65 },
  { month: 'May', Food: 160, Transport: 105, Entertainment: 85, Shopping: 40, Health: 75 },
  { month: 'Jun', Food: 170, Transport: 115, Entertainment: 95, Shopping: 100, Health: 80 },
];

// Daily spending pattern (simulated)
const dailySpendingData = [
  { hour: '6AM', amount: 5 },
  { hour: '8AM', amount: 12 },
  { hour: '10AM', amount: 8 },
  { hour: '12PM', amount: 25 },
  { hour: '2PM', amount: 15 },
  { hour: '4PM', amount: 10 },
  { hour: '6PM', amount: 30 },
  { hour: '8PM', amount: 20 },
  { hour: '10PM', amount: 5 },
];

// Budget vs actual data
const budgetData = [
  { category: 'Food', budget: 200, actual: 180, variance: -20 },
  { category: 'Transport', budget: 100, actual: 115, variance: 15 },
  { category: 'Entertainment', budget: 80, actual: 95, variance: 15 },
  { category: 'Shopping', budget: 150, actual: 100, variance: -50 },
  { category: 'Health', budget: 60, actual: 80, variance: 20 },
];

// Expense frequency data
const frequencyData = [
  { category: 'Food', frequency: 25, avgAmount: 12 },
  { category: 'Transport', frequency: 20, avgAmount: 5.5 },
  { category: 'Entertainment', frequency: 8, avgAmount: 18 },
  { category: 'Shopping', frequency: 6, avgAmount: 45 },
  { category: 'Health', frequency: 4, avgAmount: 25 },
];

// Savings data
const savingsData = [
  { month: 'Jan', saved: 150, target: 200, percentage: 75 },
  { month: 'Feb', saved: 220, target: 200, percentage: 110 },
  { month: 'Mar', saved: 80, target: 200, percentage: 40 },
  { month: 'Apr', saved: 190, target: 200, percentage: 95 },
  { month: 'May', saved: 210, target: 200, percentage: 105 },
  { month: 'Jun', saved: 120, target: 200, percentage: 60 },
];

// Chart colors
const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export default function VisualsPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Filter states
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [period, setPeriod] = useState('');
  
  // Applied filters state
  const [appliedFilters, setAppliedFilters] = useState({
    dateFrom: '',
    dateTo: '',
    period: ''
  });

  const handleApplyFilters = () => {
    setAppliedFilters({
      dateFrom,
      dateTo,
      period
    });
    setIsFilterOpen(false);
  };

  const handleClearFilters = () => {
    setDateFrom('');
    setDateTo('');
    setPeriod('');
    setAppliedFilters({
      dateFrom: '',
      dateTo: '',
      period: ''
    });
  };

  const hasActiveFilters = appliedFilters.dateFrom || appliedFilters.dateTo || appliedFilters.period;

  const getFilterDescription = () => {
    if (!hasActiveFilters) return 'All data';
    
    const parts = [];
    if (appliedFilters.period) {
      parts.push(`Period: ${appliedFilters.period}`);
    }
    if (appliedFilters.dateFrom && appliedFilters.dateTo) {
      parts.push(`${formatDate(appliedFilters.dateFrom)} - ${formatDate(appliedFilters.dateTo)}`);
    } else if (appliedFilters.dateFrom) {
      parts.push(`From: ${formatDate(appliedFilters.dateFrom)}`);
    } else if (appliedFilters.dateTo) {
      parts.push(`Until: ${formatDate(appliedFilters.dateTo)}`);
    }
    
    return parts.join(' | ');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Visuals</h1>
          <p className="text-muted-foreground">Visualize your spending patterns</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filter Data
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-1">
                    Active
                  </Badge>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Filter Charts Data</DialogTitle>
                <DialogDescription>
                  Select date range or time period to filter your expense data
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>Time Period</Label>
                  <Select value={period} onValueChange={setPeriod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="yesterday">Yesterday</SelectItem>
                      <SelectItem value="this-week">This Week</SelectItem>
                      <SelectItem value="last-week">Last Week</SelectItem>
                      <SelectItem value="this-month">This Month</SelectItem>
                      <SelectItem value="last-month">Last Month</SelectItem>
                      <SelectItem value="this-quarter">This Quarter</SelectItem>
                      <SelectItem value="last-quarter">Last Quarter</SelectItem>
                      <SelectItem value="this-year">This Year</SelectItem>
                      <SelectItem value="last-year">Last Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date-from">From Date</Label>
                    <Input
                      id="date-from"
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date-to">To Date</Label>
                    <Input
                      id="date-to"
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  <p>• Use time period for quick selection</p>
                  <p>• Or set custom date range</p>
                  <p>• Date range overrides time period</p>
                </div>
              </div>
              
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={handleClearFilters}>
                  Clear All
                </Button>
                <Button onClick={handleApplyFilters}>
                  Apply Filters
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          {hasActiveFilters && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleClearFilters}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {hasActiveFilters && (
        <Card className="bg-muted/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Active Filters:</span>
              <span className="text-sm text-muted-foreground">{getFilterDescription()}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="overview" onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Overview</CardTitle>
                <CardDescription>Spending vs Average</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${typeof value === 'number' ? typeof value === 'number' ? value.toFixed(2) : value : value}`, 'Amount']} />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="amount" 
                        stroke="hsl(var(--chart-1))" 
                        strokeWidth={2}
                        name="Spending"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="average" 
                        stroke="hsl(var(--chart-2))" 
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        name="Average"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Weekly Distribution</CardTitle>
                <CardDescription>Daily spending pattern</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${typeof value === 'number' ? typeof value === 'number' ? value.toFixed(2) : value : value}`, 'Amount']} />
                      <Bar dataKey="amount" fill="hsl(var(--chart-3))" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Daily Spending Pattern</CardTitle>
                <CardDescription>Spending by time of day</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dailySpendingData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${typeof value === 'number' ? value.toFixed(2) : value}`, 'Amount']} />
                      <Area 
                        type="monotone" 
                        dataKey="amount" 
                        stroke="hsl(var(--chart-4))" 
                        fill="hsl(var(--chart-4))"
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Budget vs Spending</CardTitle>
                <CardDescription>Weekly budget comparison</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${typeof value === 'number' ? value.toFixed(2) : value}`, 'Amount']} />
                      <Legend />
                      <Bar dataKey="amount" fill="hsl(var(--chart-1))" name="Actual" />
                      <Line 
                        type="monotone" 
                        dataKey="budget" 
                        stroke="hsl(var(--chart-2))" 
                        strokeWidth={2}
                        name="Budget"
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="categories" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Expense Distribution</CardTitle>
                <CardDescription>Breakdown by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [`$${typeof value === 'number' ? value.toFixed(2) : value}`, 'Amount']}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Category Comparison</CardTitle>
                <CardDescription>Amount spent per category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${typeof value === 'number' ? value.toFixed(2) : value}`, 'Amount']} />
                      <Bar dataKey="value" fill="hsl(var(--chart-1))" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Budget Performance</CardTitle>
                <CardDescription>Budget vs actual spending</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={budgetData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${typeof value === 'number' ? value.toFixed(2) : value}`, 'Amount']} />
                      <Legend />
                      <Bar dataKey="budget" fill="hsl(var(--chart-2))" name="Budget" />
                      <Bar dataKey="actual" fill="hsl(var(--chart-1))" name="Actual" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Expense Frequency</CardTitle>
                <CardDescription>How often you spend in each category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart cx="50%" cy="50%" innerRadius="10%" outerRadius="80%" data={frequencyData}>
                      <RadialBar 
                        label={{ position: 'insideStart', fill: '#fff' }} 
                        background 
                        dataKey="frequency" 
                        fill="hsl(var(--chart-3))"
                      />
                      <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" />
                      <Tooltip formatter={(value) => [`${value} times`, 'Frequency']} />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Category Trends</CardTitle>
                <CardDescription>Monthly spending by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={categoryTrendsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${typeof value === 'number' ? value.toFixed(2) : value}`, 'Amount']} />
                      <Legend />
                      <Line type="monotone" dataKey="Food" stroke={COLORS[0]} strokeWidth={2} />
                      <Line type="monotone" dataKey="Transport" stroke={COLORS[1]} strokeWidth={2} />
                      <Line type="monotone" dataKey="Entertainment" stroke={COLORS[2]} strokeWidth={2} />
                      <Line type="monotone" dataKey="Shopping" stroke={COLORS[3]} strokeWidth={2} />
                      <Line type="monotone" dataKey="Health" stroke={COLORS[4]} strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Spending Velocity</CardTitle>
                  <CardDescription>Rate of spending over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`$${typeof value === 'number' ? value.toFixed(2) : value}`, 'Amount']} />
                        <Area 
                          type="monotone" 
                          dataKey="amount" 
                          stroke="hsl(var(--chart-1))" 
                          fill="hsl(var(--chart-1))"
                          fillOpacity={0.6}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Savings Trend</CardTitle>
                  <CardDescription>Monthly savings vs target</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={savingsData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`$${typeof value === 'number' ? value.toFixed(2) : value}`, 'Amount']} />
                        <Legend />
                        <Bar dataKey="saved" fill="hsl(var(--chart-2))" name="Saved" />
                        <Line 
                          type="monotone" 
                          dataKey="target" 
                          stroke="hsl(var(--chart-1))" 
                          strokeWidth={2}
                          name="Target"
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="comparison" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Month-over-Month</CardTitle>
                <CardDescription>Compare monthly totals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${typeof value === 'number' ? value.toFixed(2) : value}`, 'Amount']} />
                      <Bar dataKey="amount" fill="hsl(var(--chart-4))" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Spending Analysis</CardTitle>
                <CardDescription>Detailed breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${typeof value === 'number' ? value.toFixed(2) : value}`, 'Amount']} />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="amount" 
                        stroke="hsl(var(--chart-5))" 
                        strokeWidth={2} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Income vs Expenses</CardTitle>
                <CardDescription>Monthly financial overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${typeof value === 'number' ? value.toFixed(2) : value}`, 'Amount']} />
                      <Legend />
                      <Bar dataKey="income" fill="hsl(var(--chart-2))" name="Income" />
                      <Bar dataKey="amount" fill="hsl(var(--chart-1))" name="Expenses" />
                      <Line 
                        type="monotone" 
                        dataKey="budget" 
                        stroke="hsl(var(--chart-3))" 
                        strokeWidth={2}
                        name="Budget"
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Variance Analysis</CardTitle>
                <CardDescription>Budget variance by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={budgetData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${typeof value === 'number' ? value.toFixed(2) : value}`, 'Variance']} />
                      <Bar 
                        dataKey="variance" 
                        fill="hsl(var(--chart-2))"
                        name="Variance"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}