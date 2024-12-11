
'use client'

import {JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal, useState} from "react"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import {
  Command
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CalendarIcon, ChevronsUpDown } from 'lucide-react'
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import { participants,participantAvailability,schedules } from "../../refStorage/store"


export default function Home() {
  const [open, setOpen] = useState(false)
  const [selectedParticipants, setSelectedParticipants] = useState([])
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [startDateOpen, setStartDateOpen] = useState(false)
  const [endDateOpen, setEndDateOpen] = useState(false)
  
  const [availableSlots,setAvailableSlots] = useState({})
  
  // const [participants,setParticipants] = useState({})
  
  // useEffect(()=>{
  //   async function fetchParticipants() {
  //     const res = await fetch('/api/redis');
  //     const response = await fetch('/api/redis', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({ participantsData }), // Sending data to the API
  //     });
  //     if (response.ok) {
  //       console.log('Participants saved successfully');
  //     } else {
  //       console.error('Failed to save participants');
  //     }
  //     const data = await res.json();
  //     setParticipants(data);
  //   }

  //   fetchParticipants();
  // },[])

  function splitTimeSlots(startTime: any, endTime: any, intervalMinutes = 30) {
    const timeIntervals = [];
    const toMinutes = (timeStr: { split: (arg0: string) => { (): any; new(): any; map: { (arg0: NumberConstructor): [any, any]; new(): any } } }) => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    };

    const toTimeString = (totalMinutes: number) => {
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    };

    let currentMinutes = toMinutes(startTime);
    const endMinutes = toMinutes(endTime);

    while (currentMinutes < endMinutes) {
        const nextMinutes = Math.min(currentMinutes + intervalMinutes, endMinutes);
        timeIntervals.push(`${toTimeString(currentMinutes)}-${toTimeString(nextMinutes)}`);
        currentMinutes = nextMinutes;
    }

    return timeIntervals;
}


const submitCheckSlot = async() => {

    let currentDate = new Date(startDate);
    const obj = {};

    while (currentDate <= new Date(endDate)) {
        const date = format(currentDate, "dd/MM/yyyy");
        const dayOfWeek = format(currentDate, "EEEE");

        let repeatedValues: any[] | null = null; // Start with null to handle empty cases
        selectedParticipants.forEach((participant) => {
            let participantSlots: any[] = [];
            let scheduleSlots: any[] = []
            participantAvailability[participant][dayOfWeek]?.forEach(({ start, end }) => {
                const singleSlot = splitTimeSlots(start, end);
                participantSlots = participantSlots.concat(singleSlot);
            });

            if (repeatedValues === null) {
                // First participant's slots initialize repeatedValues
                repeatedValues = participantSlots;
            } else {
              // Intersect with the current participant's slots
              repeatedValues = repeatedValues.filter((value: any) => participantSlots.includes(value));
            }

            schedules[participant][date]?.forEach(({ start, end }) => {
              const scheduledTimes = splitTimeSlots(start, end);
              scheduleSlots = scheduleSlots.concat(scheduledTimes);
            });
            repeatedValues = repeatedValues.filter((value: any)=>!scheduleSlots.includes(value))
        });

        // If no overlapping slots, set as an empty array

        if(repeatedValues.length) { 
            obj[date] = repeatedValues ;
        }

        currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
    }
    setAvailableSlots(obj)
};


  return (
    <div className="w-full max-w-md mx-auto space-y-6 p-4">
      <h1 className="text-2xl font-bold text-center mb-8">Check Availability</h1>
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between bg-gray-100"
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
              {Object.entries(participants).map(([id,participant]) => {
                return <li key={id} className="flex items-center space-x-2">
                  <Checkbox
                    checked={selectedParticipants?.includes(id)}
                    onCheckedChange={(checked) => {
                      setSelectedParticipants(
                        checked
                          ? [...selectedParticipants, id]
                          : selectedParticipants.filter((p) => p !== id)
                      )
                    }}
                  />
                  <span>{participant.name}</span>
                </li>
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
                setStartDate(date)
                setStartDateOpen(false)
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
                setEndDate(date)
                setEndDateOpen(false)
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <Button onClick={submitCheckSlot} className="w-full bg-indigo-600 hover:bg-indigo-700">Check Slot</Button>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 mt-6">
        <h2 className="font-semibold mb-4 text-center">Available Slot</h2>
        <div className="space-y-4">
          {Object.entries(availableSlots)?.map(([date,timeSlots]) => (
            <div key={date} className="flex items-center gap-4">
              <span className="w-20 text-sm">{date}</span>
              <span>:</span>
              <div className="flex flex-wrap gap-2">
                {timeSlots?.map((slot: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | null | undefined,index: Key | null | undefined) => (
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
          ))}
        </div>
      </div>
    </div>
  )
}

