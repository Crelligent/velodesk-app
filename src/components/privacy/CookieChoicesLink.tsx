'use client'

import { reopenCookieChoices } from './ConsentScripts'

export function CookieChoicesLink() {
    return (
        <button type="button" onClick={reopenCookieChoices} className="text-[#22c55e] hover:underline">
            Change cookie choices
        </button>
    )
}
