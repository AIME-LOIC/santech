# System Use Cases 

## System Overview
Think of this as the backstage system for a clinic. It keeps track of people (patients, doctors, admins), shows when doctors are available, lets patients book visits, and sends notifications when something changes.

## Primary Actors
- Patient: wants to find a time and see their upcoming visits.
- Doctor: shares open time slots and keeps an eye on their schedule.
- Admin/Staff: keeps the system tidy, up to date, and running smoothly.

## Core Use Cases

### 1. User Management
- Add a new user with their basic details.
- Look up a user or browse all users.
- Edit user information, including passwords.
- Remove a user when needed.

### 2. Doctor Availability Management
- Set which days and time slots a doctor is available.
- Review availability for one doctor or everyone.
- Adjust availability when schedules change.
- Remove availability entries that are no longer valid.

### 3. Appointment Scheduling
- Book an appointment by picking a doctor and a time.
- See upcoming appointments or a specific one.
- Update appointment details or status.
- Cancel an appointment if plans change.

### 4. Notifications
- Send messages like confirmations, changes, or reminders.
- Read all notifications or a single one.
- Mark notifications as read or tweak the message.
- Clear out old notifications.

## Typical Flow (Happy Path)
1. A doctor (or admin) posts open time slots.
2. A patient picks a slot and books a visit.
3. Both sides receive a confirmation notification.
4. The appointment moves through its normal lifecycle (scheduled, completed, or canceled).

## Assumptions
- One user table holds patients, doctors, and admins with roles.
- Appointments link a patient and a doctor by ID.
- Availability is stored per doctor with dates and time slots.
- Notifications belong to a user and can be marked as read.
