import DoctorAvailability from "../models/doctorAvailability.js";

export const doctorAvaSeed = async () => {
    await DoctorAvailability.bulkCreate([
        {
            doctorId: "d72438b4-2343-4b4c-a0db-ee45cbd9eaa3",
            availableDate: "2026-04-15",
            availableTimeSlots: ["09:00-10:00", "10:00-11:00", "14:00-15:00"]
        }
    ]);
}
        
