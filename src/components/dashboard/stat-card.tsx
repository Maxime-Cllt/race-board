import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon, Trophy } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  isNewRecord?: boolean;
}

export function StatCard({ title, value, subtitle, icon: Icon, trend, isNewRecord = false }: StatCardProps) {
  return (
    <Card className={`border-l-4 border-l-primary relative overflow-hidden transition-all duration-300 ${isNewRecord ? 'animate-new-record shadow-xl shadow-yellow-500/50 border-yellow-500' : ''}`}>
      {/* Celebration overlay */}
      {isNewRecord && (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 via-orange-500/20 to-red-500/20 animate-pulse pointer-events-none" />
          <div className="absolute top-2 right-2 animate-bounce">
            <Trophy className="h-6 w-6 text-yellow-500 drop-shadow-lg" />
          </div>
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-4 left-4 h-2 w-2 bg-yellow-500 rounded-full animate-ping" />
            <div className="absolute top-8 right-8 h-2 w-2 bg-orange-500 rounded-full animate-ping animation-delay-150" />
            <div className="absolute bottom-6 left-8 h-2 w-2 bg-red-500 rounded-full animate-ping animation-delay-300" />
          </div>
        </>
      )}

      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
        <CardTitle className={`text-sm font-medium transition-colors ${isNewRecord ? 'text-yellow-600 dark:text-yellow-400 font-bold' : ''}`}>
          {title}
        </CardTitle>
        <Icon className={`h-4 w-4 text-muted-foreground transition-all ${isNewRecord ? 'text-yellow-500 scale-125' : ''}`} />
      </CardHeader>
      <CardContent className="relative z-10">
        <div className={`text-2xl font-bold transition-all ${isNewRecord ? 'text-yellow-600 dark:text-yellow-400 scale-110' : ''}`}>
          {value}
        </div>
        {subtitle && (
          <p className={`text-xs text-muted-foreground ${isNewRecord ? 'text-yellow-700 dark:text-yellow-300 font-semibold' : ''}`}>
            {isNewRecord ? '🎉 Nouveau record!' : subtitle}
          </p>
        )}
        {trend && !isNewRecord && (
          <p className={`text-xs ${trend.isPositive ? "text-chart-4" : "text-destructive"}`}>
            {trend.isPositive ? "+" : ""}
            {trend.value}% depuis la dernière heure
          </p>
        )}
      </CardContent>
    </Card>
  );
}
