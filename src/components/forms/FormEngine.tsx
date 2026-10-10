'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'

export interface FormSchema {
    id: string
    title: string
    description?: string
    custom_css?: string
    /** Label for the submit button. Defaults to "Submit". */
    submitLabel?: string
    fields: FormField[]
}

export interface FormField {
    id: string
    type: 'text' | 'email' | 'password' | 'textarea' | 'checkbox' | 'radio' | 'select'
    label: string
    placeholder?: string
    required?: boolean
    options?: { label: string, value: string }[]
    autoComplete?: string
    /** Helper text rendered under the field and linked via aria-describedby. */
    hint?: string
}

interface FormEngineProps {
    schema: FormSchema
    sessionId: string
    onSubmit: (data: Record<string, any>) => Promise<void>
}

export function FormEngine({ schema, sessionId, onSubmit }: FormEngineProps) {
    const [answers, setAnswers] = useState<Record<string, any>>({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    
    // Telemetry tracking
    const fieldFocusTimes = useRef<Record<string, number>>({})

    // Field IDs that must never leave the browser before the user submits.
    const sensitiveFieldIds = schema.fields.filter(f => f.type === 'password').map(f => f.id)

    // 1. Partial Submission Autosave (Debounced) — passwords are never autosaved
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            const safeAnswers = Object.fromEntries(
                Object.entries(answers).filter(([key]) => !sensitiveFieldIds.includes(key))
            )
            if (Object.keys(safeAnswers).length > 0) {
                fetch('/api/forms/partial', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        form_id: schema.id,
                        session_id: sessionId,
                        current_step: 'main',
                        partial_answers: safeAnswers
                    })
                }).catch(err => console.error('Failed to autosave partial submission', err))
            }
        }, 1500) // Debounce 1.5s

        return () => clearTimeout(timeoutId)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [answers, schema.id, sessionId])

    // 2. Drop-off Analytics Tracking
    const handleFocus = useCallback((fieldId: string) => {
        fieldFocusTimes.current[fieldId] = Date.now()
        
        // Log focus event
        fetch('/api/forms/dropoff', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                form_id: schema.id,
                session_id: sessionId,
                events: [{ field_id: fieldId, event_type: 'focus', time_spent_ms: 0 }]
            })
        }).catch(() => {})
    }, [schema.id, sessionId])

    const handleBlur = useCallback((fieldId: string) => {
        const focusTime = fieldFocusTimes.current[fieldId]
        const timeSpentMs = focusTime ? Date.now() - focusTime : 0
        
        // Log blur (abandonment risk) event
        fetch('/api/forms/dropoff', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                form_id: schema.id,
                session_id: sessionId,
                events: [{ field_id: fieldId, event_type: 'blur', time_spent_ms: timeSpentMs }]
            })
        }).catch(() => {})
        
        delete fieldFocusTimes.current[fieldId]
    }, [schema.id, sessionId])

    // Handlers
    const handleChange = (fieldId: string, value: any) => {
        setAnswers(prev => ({ ...prev, [fieldId]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setIsSubmitting(true)
        try {
            await onSubmit(answers)
        } catch (err: any) {
            setError(err.message || 'An error occurred during submission.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const inputClass = 'w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded text-white placeholder:text-[#8A8A8A] focus:outline-none focus:border-[#22c55e] focus-visible:ring-2 focus-visible:ring-[#22c55e] focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505] transition'

    return (
        <div className="w-full max-w-md mx-auto">
            {/* Custom CSS Injection - Sanitized in production via server rules */}
            {schema.custom_css && (
                <style dangerouslySetInnerHTML={{ __html: schema.custom_css }} />
            )}

            <div className="mb-8 text-center">
                <h2 className="text-2xl font-light mb-2 text-white">{schema.title}</h2>
                {schema.description && (
                    <p className="text-[#8A8A8A]">{schema.description}</p>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                    <div role="alert" className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm">
                        {error}
                    </div>
                )}

                {schema.fields.map(field => {
                    const inputId = `${schema.id}-${field.id}`
                    const hintId = field.hint ? `${inputId}-hint` : undefined
                    const required = field.required ? <span className="text-red-400" aria-hidden="true">*</span> : null

                    return (
                    <div key={field.id} className="form-field-container">
                        {field.type === 'radio' ? (
                            <span id={`${inputId}-legend`} className="block text-sm text-gray-300 mb-2">
                                {field.label} {required}
                            </span>
                        ) : field.type !== 'checkbox' && (
                            <label htmlFor={inputId} className="block text-sm text-gray-300 mb-2">
                                {field.label} {required}
                            </label>
                        )}
                        
                        {(field.type === 'text' || field.type === 'email' || field.type === 'password') && (
                            <input
                                id={inputId}
                                name={field.id}
                                type={field.type}
                                value={answers[field.id] || ''}
                                onChange={(e) => handleChange(field.id, e.target.value)}
                                onFocus={() => handleFocus(field.id)}
                                onBlur={() => handleBlur(field.id)}
                                className={inputClass}
                                placeholder={field.placeholder}
                                required={field.required}
                                autoComplete={field.autoComplete}
                                aria-describedby={hintId}
                                minLength={field.type === 'password' ? 8 : undefined}
                            />
                        )}

                        {field.type === 'textarea' && (
                            <textarea
                                id={inputId}
                                name={field.id}
                                value={answers[field.id] || ''}
                                onChange={(e) => handleChange(field.id, e.target.value)}
                                onFocus={() => handleFocus(field.id)}
                                onBlur={() => handleBlur(field.id)}
                                className={`${inputClass} min-h-[100px]`}
                                placeholder={field.placeholder}
                                required={field.required}
                                aria-describedby={hintId}
                            />
                        )}

                        {field.type === 'select' && (
                            <select
                                id={inputId}
                                name={field.id}
                                value={answers[field.id] || ''}
                                onChange={(e) => handleChange(field.id, e.target.value)}
                                onFocus={() => handleFocus(field.id)}
                                onBlur={() => handleBlur(field.id)}
                                className={`${inputClass} appearance-none`}
                                required={field.required}
                                aria-describedby={hintId}
                            >
                                <option value="" disabled>Select an option...</option>
                                {field.options?.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        )}

                        {field.type === 'radio' && (
                            <div role="radiogroup" aria-labelledby={`${inputId}-legend`} aria-describedby={hintId} className="space-y-2">
                                {field.options?.map(opt => (
                                    <label key={opt.value} className="flex items-center gap-3 text-sm text-gray-300 cursor-pointer">
                                        <input
                                            type="radio"
                                            name={field.id}
                                            value={opt.value}
                                            checked={answers[field.id] === opt.value}
                                            onChange={(e) => handleChange(field.id, e.target.value)}
                                            onFocus={() => handleFocus(field.id)}
                                            onBlur={() => handleBlur(field.id)}
                                            className="w-4 h-4 accent-[#22c55e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22c55e] focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505]"
                                            required={field.required && !answers[field.id]}
                                        />
                                        <span>{opt.label}</span>
                                    </label>
                                ))}
                            </div>
                        )}

                        {field.type === 'checkbox' && (
                            <label htmlFor={inputId} className="flex items-start gap-2 text-sm text-gray-300 cursor-pointer">
                                <input
                                    id={inputId}
                                    name={field.id}
                                    type="checkbox"
                                    checked={!!answers[field.id]}
                                    onChange={(e) => handleChange(field.id, e.target.checked)}
                                    onFocus={() => handleFocus(field.id)}
                                    onBlur={() => handleBlur(field.id)}
                                    className="mt-1 rounded accent-[#22c55e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22c55e] focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505]"
                                    required={field.required}
                                    aria-describedby={hintId}
                                />
                                <span>{field.placeholder || field.label} {required}</span>
                            </label>
                        )}

                        {field.hint && (
                            <p id={hintId} className="mt-2 text-xs text-[#8A8A8A]">{field.hint}</p>
                        )}
                    </div>
                    )
                })}

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 mt-6 bg-[#22c55e] text-black font-medium rounded hover:bg-[#16a34a] transition disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505]"
                >
                    {isSubmitting ? 'Submitting...' : (schema.submitLabel || 'Submit')}
                </button>
            </form>
        </div>
    )
}
