-- Add portal role enum values (run before data migration in the next file).

alter type public.app_role add value if not exists 'superadmin';
alter type public.app_role add value if not exists 'admin';
alter type public.app_role add value if not exists 'subject-expert';
alter type public.app_role add value if not exists 'marketing-manager';
alter type public.app_role add value if not exists 'hr-manager';
alter type public.app_role add value if not exists 'accounts';
alter type public.app_role add value if not exists 'quality-manager';
alter type public.app_role add value if not exists 'student-consultant';
