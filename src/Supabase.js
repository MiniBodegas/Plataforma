import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://waiziwvurvhedorqmfre.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhaXppd3Z1cnZoZWRvcnFtZnJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNTU3MDksImV4cCI6MjA3MzYzMTcwOX0.aI0cYYeLk60RHXYY9qZhIXs-xBdDNb6DdgR6Toeq4CI'

export const supabase = createClient(supabaseUrl, supabaseKey)