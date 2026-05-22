insert into goals (id, user_email, title, category, target_date, progress, completed)
values
  (1, 'demo@gradflow.local', 'Stabilize weekly research rhythm', 'Research', current_date + 30, 35, false),
  (2, 'demo@gradflow.local', 'Build a sustainable health routine', 'Health', current_date + 45, 42, false),
  (3, 'demo@gradflow.local', 'Keep monthly spending under budget', 'Money', current_date + 20, 55, false),
  (4, 'demo@gradflow.local', 'Finish course assignment draft', 'Course', current_date + 12, 70, false)
on conflict (id) do nothing;

insert into habits (id, user_email, name, target_count, unit, icon, goal_id)
values
  (1, 'demo@gradflow.local', 'Drink water', 1, 'check', '💧', 2),
  (2, 'demo@gradflow.local', 'Exercise', 1, 'check', '🏃', 2),
  (3, 'demo@gradflow.local', 'Read paper', 1, 'check', '📚', 1),
  (4, 'demo@gradflow.local', 'Budget check', 1, 'check', '🪙', 3)
on conflict (id) do nothing;

insert into reward_items (id, user_email, name, icon, point_cost)
values
  (1, 'demo@gradflow.local', 'Coffee break', '☕', 4),
  (2, 'demo@gradflow.local', 'Movie night', '🎬', 8),
  (3, 'demo@gradflow.local', 'Bookstore visit', '📚', 12)
on conflict (id) do nothing;

insert into tasks (id, user_email, name, category, priority, effort, deadline, status, created_at, updated_at, goal_id)
values
  (1, 'demo@gradflow.local', 'Annotate related-work paper', 'Research', 5, 3, current_date - 6, 'DONE', current_timestamp - interval '12 day', current_timestamp - interval '6 day', 1),
  (2, 'demo@gradflow.local', 'Write experiment setup notes', 'Research', 4, 2, current_date - 3, 'DONE', current_timestamp - interval '9 day', current_timestamp - interval '3 day', 1),
  (3, 'demo@gradflow.local', 'Prepare advisor meeting questions', 'Meeting', 4, 2, current_date, 'PENDING', current_timestamp - interval '2 day', current_timestamp - interval '2 day', 1),
  (4, 'demo@gradflow.local', 'Implement baseline comparison', 'Research', 5, 4, current_date + 2, 'PENDING', current_timestamp - interval '1 day', current_timestamp - interval '1 day', 1),
  (5, 'demo@gradflow.local', 'Submit course reading response', 'Course', 3, 2, current_date + 1, 'PENDING', current_timestamp - interval '3 day', current_timestamp - interval '3 day', 4),
  (6, 'demo@gradflow.local', 'Plan next exercise block', 'Health', 3, 1, current_date + 1, 'PENDING', current_timestamp - interval '1 day', current_timestamp - interval '1 day', 2),
  (7, 'demo@gradflow.local', 'Reconcile this week expenses', 'Money', 3, 1, current_date + 3, 'PENDING', current_timestamp - interval '4 day', current_timestamp - interval '4 day', 3),
  (8, 'demo@gradflow.local', 'Draft intro paragraph', 'Research', 4, 3, current_date + 5, 'PENDING', current_timestamp, current_timestamp, 1)
on conflict (id) do nothing;

insert into daily_logs (
  id, user_email, log_date, sleep_hours, sleep_start, wake_time, mood, stress, study_hours,
  water_cups, water_ml, exercised, exercise_type, exercise_minutes, note, updated_at
)
values
  (1, 'demo@gradflow.local', current_date - 13, 6.8, time '00:40', time '07:30', 3, 4, 2.0, 6, 1500, true, 'Walk', 25, 'Recovered from a packed meeting day.', current_timestamp - interval '13 day'),
  (2, 'demo@gradflow.local', current_date - 12, 7.4, time '00:10', time '07:35', 4, 3, 3.0, 8, 2000, false, '', 0, 'Read two papers and made short notes.', current_timestamp - interval '12 day'),
  (3, 'demo@gradflow.local', current_date - 11, 6.2, time '01:20', time '07:30', 2, 5, 1.0, 5, 1250, true, 'Stretching', 15, 'Low energy, kept the scope small.', current_timestamp - interval '11 day'),
  (4, 'demo@gradflow.local', current_date - 10, 7.8, time '23:50', time '07:40', 4, 2, 3.5, 9, 2250, true, 'Gym', 35, 'Good focus block after lunch.', current_timestamp - interval '10 day'),
  (5, 'demo@gradflow.local', current_date - 9, 7.0, time '00:30', time '07:30', 3, 3, 2.5, 7, 1750, false, '', 0, 'Admin tasks took longer than expected.', current_timestamp - interval '9 day'),
  (6, 'demo@gradflow.local', current_date - 8, 8.1, time '23:40', time '07:45', 5, 2, 4.0, 10, 2500, true, 'Run', 30, 'Finished experiment setup notes.', current_timestamp - interval '8 day'),
  (7, 'demo@gradflow.local', current_date - 7, 6.6, time '01:00', time '07:35', 3, 4, 2.0, 6, 1500, false, '', 0, 'Needed more breaks between tasks.', current_timestamp - interval '7 day'),
  (8, 'demo@gradflow.local', current_date - 6, 7.2, time '00:15', time '07:30', 4, 3, 3.0, 8, 2000, true, 'Walk', 20, 'Advisor feedback was actionable.', current_timestamp - interval '6 day'),
  (9, 'demo@gradflow.local', current_date - 5, 7.6, time '23:55', time '07:30', 4, 2, 3.5, 9, 2250, true, 'Yoga', 25, 'Cleaned up notes and references.', current_timestamp - interval '5 day'),
  (10, 'demo@gradflow.local', current_date - 4, 5.9, time '01:35', time '07:30', 2, 5, 1.0, 4, 1000, false, '', 0, 'Deadline pressure; need lighter planning.', current_timestamp - interval '4 day'),
  (11, 'demo@gradflow.local', current_date - 3, 7.3, time '00:05', time '07:25', 4, 3, 2.5, 8, 2000, true, 'Gym', 40, 'Submitted reading response draft.', current_timestamp - interval '3 day'),
  (12, 'demo@gradflow.local', current_date - 2, 8.0, time '23:30', time '07:30', 5, 2, 4.5, 10, 2500, true, 'Run', 30, 'Strong deep work session.', current_timestamp - interval '2 day'),
  (13, 'demo@gradflow.local', current_date - 1, 6.7, time '00:50', time '07:35', 3, 4, 2.0, 7, 1750, false, '', 0, 'Blocked on baseline comparison detail.', current_timestamp - interval '1 day'),
  (14, 'demo@gradflow.local', current_date, 7.5, time '00:00', time '07:30', 4, 3, 1.5, 8, 2000, true, 'Walk', 20, 'Seed check-in for first launch.', current_timestamp)
on conflict (id) do nothing;

insert into habit_records (id, user_email, habit_id, record_date, count)
values
  (1, 'demo@gradflow.local', 1, current_date - 13, 1), (2, 'demo@gradflow.local', 3, current_date - 13, 1),
  (3, 'demo@gradflow.local', 1, current_date - 12, 1), (4, 'demo@gradflow.local', 3, current_date - 12, 1), (5, 'demo@gradflow.local', 4, current_date - 12, 1),
  (6, 'demo@gradflow.local', 1, current_date - 11, 1), (7, 'demo@gradflow.local', 2, current_date - 11, 1),
  (8, 'demo@gradflow.local', 1, current_date - 10, 1), (9, 'demo@gradflow.local', 2, current_date - 10, 1), (10, 'demo@gradflow.local', 3, current_date - 10, 1),
  (11, 'demo@gradflow.local', 1, current_date - 9, 1), (12, 'demo@gradflow.local', 4, current_date - 9, 1),
  (13, 'demo@gradflow.local', 1, current_date - 8, 1), (14, 'demo@gradflow.local', 2, current_date - 8, 1), (15, 'demo@gradflow.local', 3, current_date - 8, 1),
  (16, 'demo@gradflow.local', 1, current_date - 7, 1),
  (17, 'demo@gradflow.local', 1, current_date - 6, 1), (18, 'demo@gradflow.local', 2, current_date - 6, 1), (19, 'demo@gradflow.local', 3, current_date - 6, 1),
  (20, 'demo@gradflow.local', 1, current_date - 5, 1), (21, 'demo@gradflow.local', 2, current_date - 5, 1), (22, 'demo@gradflow.local', 4, current_date - 5, 1),
  (23, 'demo@gradflow.local', 1, current_date - 4, 1),
  (24, 'demo@gradflow.local', 1, current_date - 3, 1), (25, 'demo@gradflow.local', 2, current_date - 3, 1), (26, 'demo@gradflow.local', 3, current_date - 3, 1),
  (27, 'demo@gradflow.local', 1, current_date - 2, 1), (28, 'demo@gradflow.local', 2, current_date - 2, 1), (29, 'demo@gradflow.local', 3, current_date - 2, 1), (30, 'demo@gradflow.local', 4, current_date - 2, 1),
  (31, 'demo@gradflow.local', 1, current_date - 1, 1), (32, 'demo@gradflow.local', 3, current_date - 1, 1),
  (33, 'demo@gradflow.local', 1, current_date, 1), (34, 'demo@gradflow.local', 2, current_date, 1)
on conflict (id) do nothing;

insert into expenses (id, user_email, expense_date, category, type, amount, description)
values
  (1, 'demo@gradflow.local', current_date - 13, 'Food', 'EXPENSE', 180, 'Lunch box'),
  (2, 'demo@gradflow.local', current_date - 12, 'Coffee', 'EXPENSE', 85, 'Cafe study block'),
  (3, 'demo@gradflow.local', current_date - 11, 'Transport', 'EXPENSE', 40, 'Bus to campus'),
  (4, 'demo@gradflow.local', current_date - 10, 'Books', 'EXPENSE', 620, 'Research methods book'),
  (5, 'demo@gradflow.local', current_date - 9, 'Scholarship', 'INCOME', 8000, 'Monthly scholarship'),
  (6, 'demo@gradflow.local', current_date - 8, 'Food', 'EXPENSE', 210, 'Dinner'),
  (7, 'demo@gradflow.local', current_date - 7, 'Health', 'EXPENSE', 350, 'Gym day pass'),
  (8, 'demo@gradflow.local', current_date - 6, 'Coffee', 'EXPENSE', 95, 'Advisor meeting coffee'),
  (9, 'demo@gradflow.local', current_date - 5, 'Shopping', 'EXPENSE', 480, 'Stationery'),
  (10, 'demo@gradflow.local', current_date - 4, 'Food', 'EXPENSE', 160, 'Noodles'),
  (11, 'demo@gradflow.local', current_date - 3, 'Transport', 'EXPENSE', 60, 'MRT'),
  (12, 'demo@gradflow.local', current_date - 2, 'Part-time', 'INCOME', 2200, 'TA support'),
  (13, 'demo@gradflow.local', current_date - 1, 'Fun', 'EXPENSE', 300, 'Relax night'),
  (14, 'demo@gradflow.local', current_date, 'Food', 'EXPENSE', 190, 'Lunch')
on conflict (id) do nothing;

insert into research_logs (id, user_email, log_date, topic, progress, blockers, next_step, blocker_solved, next_step_solved, hours)
values
  (1, 'demo@gradflow.local', current_date - 12, 'Federated learning survey', 'Skimmed three related-work sections.', '', 'Summarize privacy assumptions.', false, false, 2.0),
  (2, 'demo@gradflow.local', current_date - 10, 'Baseline experiment', 'Prepared dataset split and run notes.', 'Need to confirm metric definition.', 'Ask advisor about evaluation metric.', false, false, 2.5),
  (3, 'demo@gradflow.local', current_date - 8, 'Experiment setup', 'Finished initial config and command list.', '', 'Run small-scale sanity check.', false, false, 3.0),
  (4, 'demo@gradflow.local', current_date - 6, 'Advisor feedback', 'Converted feedback into tasks.', '', 'Draft comparison table.', false, false, 1.5),
  (5, 'demo@gradflow.local', current_date - 4, 'Related work writing', 'Outlined paragraph order.', 'Unsure how to contrast paper B.', 'Write one rough paragraph anyway.', false, false, 1.0),
  (6, 'demo@gradflow.local', current_date - 2, 'Baseline comparison', 'Ran first comparison pass.', '', 'Collect charts for meeting.', false, false, 2.5),
  (7, 'demo@gradflow.local', current_date - 1, 'Error analysis', 'Found two suspicious failure cases.', 'Need more examples before conclusion.', 'Inspect 10 more cases.', false, false, 1.5)
on conflict (id) do nothing;

update research_logs set blocker_solved = false where blocker_solved is null;
update research_logs set next_step_solved = false where next_step_solved is null;

insert into calendar_events (id, user_email, title, event_date, start_date, end_date, start_time, end_time, category, note)
values
  (1, 'demo@gradflow.local', 'Advisor meeting', current_date - 6, current_date - 6, current_date - 6, time '14:00', time '15:00', 'Meeting', 'Discuss experiment direction'),
  (2, 'demo@gradflow.local', 'Course seminar', current_date - 3, current_date - 3, current_date - 3, time '10:00', time '12:00', 'Course', 'Reading response due'),
  (3, 'demo@gradflow.local', 'Gym session', current_date - 2, current_date - 2, current_date - 2, time '18:30', time '19:15', 'Health', 'Run and stretch'),
  (4, 'demo@gradflow.local', 'Research focus block', current_date, current_date, current_date, time '09:30', time '11:30', 'Study', 'Baseline comparison'),
  (5, 'demo@gradflow.local', 'Budget review', current_date + 2, current_date + 2, current_date + 2, time '20:00', time '20:30', 'Life', 'Check weekly expenses')
on conflict (id) do nothing;

insert into reward_redemptions (id, user_email, reward_id, redeemed_date, point_cost)
values
  (1, 'demo@gradflow.local', 1, current_date - 8, 4),
  (2, 'demo@gradflow.local', 1, current_date - 3, 4),
  (3, 'demo@gradflow.local', 2, current_date - 1, 8)
on conflict (id) do nothing;

select setval(pg_get_serial_sequence('goals', 'id'), greatest((select coalesce(max(id), 1) from goals), 1), true);
select setval(pg_get_serial_sequence('habits', 'id'), greatest((select coalesce(max(id), 1) from habits), 1), true);
select setval(pg_get_serial_sequence('reward_items', 'id'), greatest((select coalesce(max(id), 1) from reward_items), 1), true);
select setval(pg_get_serial_sequence('tasks', 'id'), greatest((select coalesce(max(id), 1) from tasks), 1), true);
select setval(pg_get_serial_sequence('daily_logs', 'id'), greatest((select coalesce(max(id), 1) from daily_logs), 1), true);
select setval(pg_get_serial_sequence('habit_records', 'id'), greatest((select coalesce(max(id), 1) from habit_records), 1), true);
select setval(pg_get_serial_sequence('expenses', 'id'), greatest((select coalesce(max(id), 1) from expenses), 1), true);
select setval(pg_get_serial_sequence('research_logs', 'id'), greatest((select coalesce(max(id), 1) from research_logs), 1), true);
select setval(pg_get_serial_sequence('calendar_events', 'id'), greatest((select coalesce(max(id), 1) from calendar_events), 1), true);
select setval(pg_get_serial_sequence('reward_redemptions', 'id'), greatest((select coalesce(max(id), 1) from reward_redemptions), 1), true);
