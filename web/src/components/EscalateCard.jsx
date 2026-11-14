/*
 * EscalateCard: the "Send to Earth" card inside the alert panel.
 * PROPS: alert (today's alert), delay (radio delay for the chosen destination).
 *
 * It behaves like a tiny state machine with three phases stored in state:
 *   'ready'   -> show the Send and Copy buttons
 *   'sending' -> show a progress bar for the radio delay (SPED UP: 1 second per minute)
 *   'sent'    -> show "Delivered" and how long a reply will take
 * AlertPanel gives this card key={alert_id}. A new key makes React create a fresh card,
 * so every new alert starts back at 'ready'.
 */
import { useState } from 'react'
import { Send, Satellite, Copy, Check } from 'lucide-react'

export default function EscalateCard({ alert, delay }) {
  const [phase, setPhase] = useState('ready') // ready -> sending -> sent
  const [copied, setCopied] = useState(false)

  if (!alert.escalate_to_earth) {
    return (
      <div className="escalate">
        <p className="escalate-title">
          <Satellite size={15} /> Handle onboard
        </p>
        <p className="muted small">This goes to Earth if it continues tomorrow.</p>
      </div>
    )
  }

  // The transmission is SPED UP for the demo: 1 second on screen per real minute of delay
  const duration = Math.max(1500, delay.minutes * 1000)
  const send = () => {
    setPhase('sending')
    setTimeout(() => setPhase('sent'), duration)
  }
  const copy = () =>
    navigator.clipboard.writeText(alert.earth_message ?? '').then(() => setCopied(true))

  return (
    <div className="escalate is-earth">
      <p className="escalate-title">
        <Satellite size={15} /> Send to Earth
      </p>
      <p className="muted small">Arrives in {delay.text}.</p>

      {phase === 'ready' && (
        <div className="escalate-actions">
          <button type="button" className="button-primary" onClick={send}>
            <Send size={14} /> Send to Mission Control
          </button>
          <button type="button" className="button-ghost" onClick={copy}>
            {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      )}
      {phase === 'sending' && (
        <>
          <div className="transmit">
            <span style={{ animationDuration: `${duration}ms` }} />
          </div>
          <p className="muted small">Signal in transit (sped up for the demo)</p>
        </>
      )}
      {phase === 'sent' && (
        <p className="sent">
          <Check size={14} /> Delivered.{' '}
          {delay.minutes > 0 ? `Reply in at least ${delay.minutes * 2} minutes.` : 'Reply expected almost immediately.'}
        </p>
      )}

      {/* The message stays tucked away unless someone wants to read it */}
      <details className="message-preview">
        <summary>Preview message</summary>
        <p>{alert.earth_message}</p>
      </details>
    </div>
  )
}
