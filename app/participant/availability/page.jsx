"use client";

import { useState, } from "react";
// import {format} from "dayjs"
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Command } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger, } from "@/components/ui/popover";
import { CalendarIcon, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { participants, participantAvailability, schedules, } from "../../refStorage/store";

export default function Home() {
  const [open, setOpen] = useState(false);
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  const [availableSlots, setAvailableSlots] = useState({});


  function splitTimeSlots(startTime, endTime, intervalMinutes = 30) {
    const timeIntervals = [];
    const toMinutes = (timeStr) => {
      const [hours, minutes] = timeStr.split(":").map(Number);
      return hours * 60 + minutes;
    };

    const toTimeString = (totalMinutes) => {
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    };

    let currentMinutes = toMinutes(startTime);
    const endMinutes = toMinutes(endTime);

    while (currentMinutes < endMinutes) {
      const nextMinutes = Math.min(
        currentMinutes + intervalMinutes,
        endMinutes
      );
      timeIntervals.push(
        `${toTimeString(currentMinutes)}-${toTimeString(nextMinutes)}`
      );
      currentMinutes = nextMinutes;
    }

    return timeIntervals;
  }

  //start

  const checkParticipantAvailableSlots = async () => {
    let currentDate = new Date(startDate); // Starting date
    const obj = {}; // To store the available slots
  
    if (!startDate || !endDate || selectedParticipants.length === 0) {
      alert("Please select Participants and Dates");
      return;
    }
  
    const isValidSlot = (slot) => {
      const [start, end] = slot.split("-");
      const toMinutes = (timeStr) => {
        const [hours, minutes] = timeStr.split(":").map(Number);
        return hours * 60 + minutes;
      };
      const duration = toMinutes(end) - toMinutes(start);
      return duration === 30; // Valid slot must be exactly 30 minutes
    };
  
    while (currentDate <= new Date(endDate)) {
      const date = format(currentDate, "dd/MM/yyyy"); // Format the current date
      const dayOfWeek = format(currentDate, "EEEE"); // Get the day of the week
      let repeatedValues = null; // Initialize repeated values for intersection
  
      selectedParticipants.forEach((participant_id) => {
        let participantSlots = [];
        let scheduleSlots = [];
        let meetingsCount = 0;
  
        // Check participant's scheduled meetings on this date
        if (schedules[participant_id] && schedules[participant_id][date]) {
          meetingsCount = schedules[participant_id][date].length;
        }
  
        // Fetch participant's available slots for the day of the week
        if (
          participantAvailability[participant_id] &&
          participantAvailability[participant_id][dayOfWeek]
        ) {
          participantAvailability[participant_id][dayOfWeek]?.forEach(
            ({ start, end }) => {
              const singleSlot = splitTimeSlots(start, end);
              participantSlots = participantSlots.concat(singleSlot);
            }
          );
        }
  
        // Initialize repeatedValues with the first participant's slots
        if (repeatedValues === null) {
          repeatedValues = participantSlots;
        } else {
          // Intersect with the current participant's slots
          repeatedValues = repeatedValues.filter((value) =>
            participantSlots.includes(value)
          );
        }

        

  
        // Fetch participant's scheduled slots for the specific date
        
        if (schedules[participant_id] && schedules[participant_id][date]) {
          schedules[participant_id][date]?.forEach(({ start, end }) => {
            const scheduledTimes = splitTimeSlots(start, end);
            scheduleSlots = scheduleSlots.concat(scheduledTimes);
            
          });
        }
  
        // Remove scheduled slots and enforce the threshold
        repeatedValues = repeatedValues.filter((value) => {           // '09:00-09:30'
          const [slotStart, slotEnd] = value.split("-");              // => [ '09:00', '09:30' ] ,[slotStart, slotEnd]
          
          const isSlotOverlapping = scheduleSlots.some((scheduledSlot) => {    
            const [scheduledStart, scheduledEnd] = scheduledSlot.split("-");  // [ '09:30', '10:00' ] first iteration in first filter

            return (
              (slotStart >= scheduledStart && slotStart < scheduledEnd) || // Slot starts during a scheduled time
              (slotEnd > scheduledStart && slotEnd <= scheduledEnd) || // Slot ends during a scheduled time
              (slotStart <= scheduledStart && slotEnd >= scheduledEnd) // Slot fully overlaps a scheduled time
            );
          });
  
          // Ensure slot is valid, not overlapping, and below threshold
          const participantThreshold = participants[participant_id]?.threshold || 0;
          return (
            isValidSlot(value) &&
            !isSlotOverlapping &&
            meetingsCount < participantThreshold
          );
        });
  
        // Update the meeting count based on the slots
        meetingsCount += repeatedValues.length;
      });
  
      // If there are valid slots, add them to the result
      if (repeatedValues && repeatedValues.length) {
        obj[date] = repeatedValues;
      }
  
      // Move to the next day
      currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
    }
  
    setAvailableSlots(obj);
  };
  

  //end
 

  // Helper function to check if two time slots overlap
  function isOverlap(slot1, slot2) {
    const [start1, end1] = slot1.split("-").map(toMinutes);
    const [start2, end2] = slot2.split("-").map(toMinutes);
    return Math.max(start1, start2) < Math.min(end1, end2); // Check overlap
  }

  // Helper to convert time string to minutes
  function toMinutes(timeStr) {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 60 + minutes;
  }



  return (
    <div className="w-full max-w-md mx-auto space-y-6 p-4">
      <h1 className="text-2xl font-bold text-center mb-8">
        Check Availability
      </h1>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between bg-grey-100"
          >
            {selectedParticipants.length > 0
              ? `${selectedParticipants.length} participants selected`
              : "Choose Participants"}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <div className="">
              {Object.entries(participants).map(([id, participant]) => {
                return (
                  <li key={id} className="flex items-center space-x-2">
                    <Checkbox
                      checked={selectedParticipants?.includes(id)}
                      onCheckedChange={(checked) => {
                        setSelectedParticipants(
                          checked
                            ? [...selectedParticipants, id]
                            : selectedParticipants.filter((p) => p !== id)
                        );
                      }}
                    />
                    <span>{participant.name}</span>
                  </li>
                );
              })}
            </div>
          </Command>
        </PopoverContent>
      </Popover>

      <div className="grid gap-4">
        <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal bg-gray-100",
                !startDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {startDate ? format(startDate, "dd-MM-yy") : "Start Date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={(date) => {
                setStartDate(date);
                setStartDateOpen(false);
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal bg-gray-100",
                !endDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {endDate ? format(endDate, "dd-MM-yy") : "End Date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={endDate}
              onSelect={(date) => {
                setEndDate(date);
                setEndDateOpen(false);
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <Button
          onClick={checkParticipantAvailableSlots}
          className="w-full bg-indigo-600 hover:bg-indigo-700"
        >
          Check Slot
        </Button>
      </div>
      <div className="bg-red-100 rounded-lg p-4 mt-6">
        <h2 className="font-semibold mb-4 text-center">Available Slot</h2>
        <div className="space-y-4">
          {Object.keys(availableSlots).length === 0 ? (
            <p className="text-center text-gray-600">No available slots found...</p>
          ) : (
            Object.entries(availableSlots)?.map(([date, timeSlots]) => (
              <div key={date} className="flex items-center gap-4">
                <span className="w-20 text-sm">{date}</span>
                <span>:</span>
                <div className="flex flex-wrap gap-2">
                  {timeSlots?.map((slot, index) => (
                    <Button
                      key={index}
                      variant="secondary"
                      className="bg-indigo-600 text-white hover:bg-indigo-700 text-xs"
                    >
                      {slot}
                    </Button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
