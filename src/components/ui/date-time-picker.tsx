"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";

interface DateTimePickerProps {
  date?: Date;
  onDateChange: (date: Date | undefined) => void;
  label?: string;
  placeholder?: string;
}

export function DateTimePicker({
  date,
  onDateChange,
  label,
  placeholder = "Sélectionner une date et heure",
}: DateTimePickerProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(date);
  const [timeValue, setTimeValue] = React.useState<string>(
    date ? format(date, "HH:mm") : "00:00"
  );

  React.useEffect(() => {
    if (date) {
      setSelectedDate(date);
      setTimeValue(format(date, "HH:mm"));
    }
  }, [date]);

  const handleDateSelect = (newDate: Date | undefined) => {
    if (!newDate) {
      setSelectedDate(undefined);
      onDateChange(undefined);
      return;
    }

    // Combine selected date with current time
    const [hours, minutes] = timeValue.split(":").map(Number);
    newDate.setHours(hours, minutes, 0, 0);
    setSelectedDate(newDate);
    onDateChange(newDate);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setTimeValue(newTime);

    if (selectedDate) {
      const [hours, minutes] = newTime.split(":").map(Number);
      const newDate = new Date(selectedDate);
      newDate.setHours(hours, minutes, 0, 0);
      setSelectedDate(newDate);
      onDateChange(newDate);
    }
  };

  return (
    <div className="space-y-2">
      {label && <Label className="text-sm">{label}</Label>}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !selectedDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedDate ? (
              format(selectedDate, "dd/MM/yyyy HH:mm")
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            initialFocus
          />
          <div className="p-3 border-t">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="time" className="text-sm">
                Heure
              </Label>
              <input
                id="time"
                type="time"
                value={timeValue}
                onChange={handleTimeChange}
                className="flex-1 px-3 py-2 border rounded-md text-sm"
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
