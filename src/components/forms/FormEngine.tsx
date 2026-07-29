'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'

export interface FormSchema {
    id: string
    title: string
    description?: string
    custom_css?: string
    fields: FormField[]
}

export interface FormField {
    id: string
    type: 'text' | 'email' | 'password' | 'textarea' | 'checkbox' | 'radio' | 'select'
    label: string
    placeholder?: string
    required?: boolean
    options?: { label: string, value: string }[]
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

    // 1. Partial Submission Autosave (Debounced)
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (Object.keys(answers).length > 0) {
                fetch('/api/forms/partial', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        form_id: schema.id,
                        session_id: sessionId,
                        current_step: 'main',
                        partial_answers: answers
                    })
                }).catch(err => console.error('Failed to autosave partial submission', err))
            }
        }, 1500) // Debounce 1.5s

        return () => clearTimeout(timeoutId)
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

    return (
        <div className="w-full max-w-md mx-auto">
            {/* Custom CSS Injection - Sanitized in production via server rules */}
            {schema.custom_css && (
                <style dangerouslySetInnerHTML={{ __html: schema.custom_css }} />
            )}

            <div className="mb-8 text-center">
                <h2 className="text-2xl font-light mb-2">{schema.title}</h2>
                {schema.description && (
                    <p className="text-gray-500">{schema.description}</p>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm">
                        {error}
                    </div>
                )}

                {schema.fields.map(field => (
                    <div key={field.id} className="form-field-container">
                        <label className="block text-sm text-gray-400 mb-2">
                            {field.label} {field.required && <span className="text-red-500">*</span>}
                        </label>
                        
                        {(field.type === 'text' || field.type === 'email' || field.type === 'password') && (
                            <input
                                type={field.type}
                                value={answers[field.id] || ''}
                                onChange={(e) => handleChange(field.id, e.target.value)}
                                onFocus={() => handleFocus(field.id)}
                                onBlur={() => handleBlur(field.id)}
                                className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded focus:outline-none focus:border-[#22c55e] transition"
                                placeholder={field.placeholder}
                                required={field.required}
                            />
                        )}

                        {field.type === 'textarea' && (
                            <textarea
                                value={answers[field.id] || ''}
                                onChange={(e) => handleChange(field.id, e.target.value)}
                                onFocus={() => handleFocus(field.id)}
                                onBlur={() => handleBlur(field.id)}
                                className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded focus:outline-none focus:border-[#22c55e] transition min-h-[100px]"
                                placeholder={field.placeholder}
                                required={field.required}
                            />
                        )}

                        {field.type === 'select' && (
                            <select
                                value={answers[field.id] || ''}
                                onChange={(e) => handleChange(field.id, e.target.value)}
                                onFocus={() => handleFocus(field.id)}
                                onBlur={() => handleBlur(field.id)}
                                className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded focus:outline-none focus:border-[#22c55e] transition appearance-none"
                                required={field.required}
                            >
                                <option value="" disabled>Select an option...</option>
                                {field.options?.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        )}

                        {field.type === 'radio' && (
                            <div className="space-y-2">
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
                                            className="w-4 h-4 text-[#22c55e] bg-white/[0.03] border-white/10 focus:ring-[#22c55e] focus:ring-2"
                                            required={field.required && !answers[field.id]}
                                        />
                                        <span>{opt.label}</span>
                                    </label>
                                ))}
                            </div>
                        )}

                        {field.type === 'checkbox' && (
                            <label className="flex items-start gap-2 text-sm text-gray-400 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={!!answers[field.id]}
                                    onChange={(e) => handleChange(field.id, e.target.checked)}
                                    onFocus={() => handleFocus(field.id)}
                                    onBlur={() => handleBlur(field.id)}
                                    className="mt-1 rounded"
                                    required={field.required}
                                />
                                <span>{field.placeholder || field.label}</span>
                            </label>
                        )}
                    </div>
                ))}

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 mt-6 bg-[#22c55e] text-black font-medium rounded hover:bg-[#16a34a] transition disabled:opacity-50"
                >
                    {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
            </form>
        </div>
    )
}
