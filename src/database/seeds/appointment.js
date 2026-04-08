import appointment from "../models/appointments.js";

export const seedAppointments = async () => {
    const appointmentsData = [
        {
            doctorId: 'd72438b4-2343-4b4c-a0db-ee45cbd9eaa3',
            patientId: 'da4209ec-ede5-4d35-8dca-a2b655b36ee8',
            appointmentDate: '2024-07-01',
            appointmentTime: '10:00 AM',
            status: 'scheduled',
        }
    ];

    for (const appointmentData of appointmentsData) {
        await appointment.create(appointmentData);
    }
}