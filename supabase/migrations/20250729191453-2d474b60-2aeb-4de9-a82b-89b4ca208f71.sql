-- Fix function search path security warnings by setting search_path for all functions
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
ALTER FUNCTION public.calculate_longest_drive(uuid) SET search_path = public;
ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.calculate_accuracy_average(uuid) SET search_path = public;
ALTER FUNCTION public.update_user_stats(uuid) SET search_path = public;
ALTER FUNCTION public.trigger_update_user_stats() SET search_path = public;
ALTER FUNCTION public.match_embedding(vector, float, int, text) SET search_path = public;