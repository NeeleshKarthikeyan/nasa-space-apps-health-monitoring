import { useState } from 'react'

export default function EscalateCard({ alert, delay }) {
  const [copied, setCopied] = useState(false)

  if (!alert.escalate_to_earth) {
    return (
      <div className="escalate onboard">
        <h4>Handle onboard</h4>
        <p>Follow the actions above. This goes to Earth if it continues tomorrow.</p>
      </div>
    )
  }

  const copy = () =>
    navigator.clipboard.writeText(alert.earth_message ?? '').then(() => setCopied(true))

  return (
    <div className="escalate earth">
      <h4>Send to Earth</h4>
      <p>
        The message arrives in {delay.text}.
        {delay.minutes > 0
          ? ` A reply takes at least ${delay.minutes * 2} minutes, so act on the steps above now.`
          : ' Flight surgeons can reply almost immediately.'}
      </p>
      <textarea readOnly rows={4} value={alert.earth_message ?? ''} />
      <button type="button" onClick={copy}>
        {copied ? 'Copied' : 'Copy message'}
      </button>
    </div>
  )
}