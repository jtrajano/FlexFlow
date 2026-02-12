Step 1 — Generate Default Schedule

Inputs:

Weekly frequency (e.g., 5 sessions)

Workout distribution (e.g., weights 2 sessions, cardio 2 sessions, yoga 1 session)

Algorithm (simplest version):

Assign workouts to days, trying to space them evenly (avoid back-to-back heavy sessions if possible)

Assign types according to distribution

Optional: set default time (e.g., 6 PM) — can be changed by user

Example:

Day Workout Type Duration
Monday Weights 50 min
Tuesday Cardio 40 min
Wednesday Rest —
Thursday Weights 50 min
Friday Cardio 40 min
Saturday Yoga 40 min
Sunday Rest —

✅ Weekly minutes sum = 220
✅ Weekly frequency sum = 5 sessions

Step 2 — User Customization

Users can reschedule days (e.g., move cardio from Tuesday → Friday)

Optionally adjust session duration

Optionally change time of day

Step 3 — Save Schedule

Database Tables Suggested:

UserWorkoutSchedule

Id UserGoalId DayOfWeek WorkoutType DurationMinutes TimeOfDay
1 101 Monday Weights 50 18:00
2 101 Tuesday Cardio 40 18:00
… … … … … …

UserWorkoutSchedule is derived from WorkoutTypeDistribution and weeklyWorkoutFrequencyTarget

If user modifies schedule, update table

Step 4 — Dashboard Integration

Dashboard rings read logged workouts vs planned schedule:

Move Ring → calories burned vs target

Exercise Ring → minutes completed vs scheduled

Stand Ring → sessions completed vs scheduled

Example: if Wednesday is rest, no rings progress; if Monday weights completed, exercise ring + minutes updated.
