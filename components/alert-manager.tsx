'use client'

import { useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function AlertManager() {
  const supabase = createClient()
  // Keep track of IDs to avoid duplicate timers
  const scheduledAlerts = useRef<Set<number>>(new Set())

  useEffect(() => {
    // 1. Request Permission on Mount
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission()
      }
    }

    // 2. Scheduler Logic
    const scheduleAlert = (id: number, content: string, alertAt: string) => {
      if (scheduledAlerts.current.has(id)) return 

      const triggerTime = new Date(alertAt).getTime()
      const now = Date.now()
      const delay = triggerTime - now

      // Only schedule if it's in the future (and within next 24h to save memory)
      if (delay > 0 && delay < 24 * 60 * 60 * 1000) {
        console.log(`⏰ Alert scheduled for note ${id} in ${Math.round(delay/1000)}s`)
        scheduledAlerts.current.add(id)
        
        setTimeout(() => {
          // Trigger System Notification
          if (Notification.permission === 'granted') {
            new Notification("🧠 Brain Alert", {
              body: content,
              icon: '/favicon.ico',
              requireInteraction: true // Keeps it on screen until clicked
            })
          } else {
            // Fallback for when permission denied
            alert(`⏰ Reminder: ${content}`)
          }
          
          scheduledAlerts.current.delete(id)
        }, delay)
      }
    }

    // 3. Load Pending Alerts (Initial Fetch)
    const loadPendingAlerts = async () => {
      const { data } = await supabase
        .from('notes')
        .select('id, content, alert_at')
        .not('alert_at', 'is', null)
        .gt('alert_at', new Date().toISOString()) // Only future alerts
      
      data?.forEach(note => {
        if (note.alert_at) scheduleAlert(note.id, note.content, note.alert_at)
      })
    }

    loadPendingAlerts()

    // 4. Listen for NEW/UPDATED Alerts (Realtime)
    const channel = supabase
      .channel('alerts-listener')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notes' }, (payload) => {
        const note = payload.new as any
        if (note.alert_at) {
           // If alert time changed or new note added, schedule it
           scheduleAlert(note.id, note.content, note.alert_at)
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  return null // This component is invisible
}