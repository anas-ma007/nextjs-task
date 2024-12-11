export const participants = {
    1: { "name": "Adam", "threshold": 4 },
    2: { "name": "Bosco", "threshold": 4 },
    3: { "name": "Catherine", "threshold": 5 }
};


export const participantAvailability = {
    1: {
        "Monday": [{ "start": "09:00", "end": "11:00" }, {
            "start":
                "14:00", "end": "16:30"
        }],
        "Tuesday": [{ "start": "09:00", "end": "18:00" }]
    },
    2: {
        "Monday": [{ "start": "09:00", "end": "18:00" }],
        "Tuesday": [{ "start": "09:00", "end": "11:30" }]
    },
    3: {
        "Monday": [{ "start": "09:00", "end": "18:00" }],
        "Tuesday": [{ "start": "09:00", "end": "18:00"}]
    }
}

export const schedules = {
    1: {
        "09/12/2024": [{ "start": "09:30", "end": "10:30" }, {
            "start": "15:00", "end": "16:30"
        }]
    },
    2: {
        "10/12/2024": [{ "start": "13:00", "end": "13:30" }],
        "11/12/2024": [{ "start": "09:00", "end": "10:30" }]
    }
};