'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { Upload, X } from 'lucide-react'
import Image from 'next/image'
import { calculateSurveyBaseline } from '@/lib/ml'

const industries = [
    'Fintech',
    'Edtech',
    'Healthtech',
    'Agritech',
    'SaaS / B2B',
    'E-commerce',
    'Logistics',
    'Other',
]

const stages = ['Ideation', 'MVP', 'Growth', 'Scaling']

export default function OnboardingPage() {
    const router = useRouter()
    const [currentStep, setCurrentStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [logoPreview, setLogoPreview] = useState<string | null>(null)
    const [logoFile, setLogoFile] = useState<File | null>(null)
    const [uploadingLogo, setUploadingLogo] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [formData, setFormData] = useState({
        companyName: '',
        industry: '',
        stage: '',
        valueProp: '',
    })
    const [baselineScore, setBaselineScore] = useState(0)
    const [animatedScore, setAnimatedScore] = useState(0)

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const totalSteps = 4
    const timeEstimates = ['~2 min remaining', '~1 min remaining', '~30 sec remaining', 'Complete']

    const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file')
                return
            }
            // Validate file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                alert('Image must be less than 2MB')
                return
            }
            setLogoFile(file)
            const reader = new FileReader()
            reader.onload = (e) => {
                setLogoPreview(e.target?.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const removeLogo = () => {
        setLogoFile(null)
        setLogoPreview(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const uploadLogo = async (userId: string): Promise<string | null> => {
        if (!logoFile) return null

        setUploadingLogo(true)
        try {
            const fileExt = logoFile.name.split('.').pop()
            const fileName = `${userId}/logo.${fileExt}`

            const { error: uploadError } = await supabase.storage
                .from('logos')
                .upload(fileName, logoFile, { upsert: true })

            if (uploadError) {
                console.error('Logo upload error:', uploadError)
                return null
            }

            const { data } = supabase.storage.from('logos').getPublicUrl(fileName)
            return data.publicUrl
        } catch (error) {
            console.error('Logo upload failed:', error)
            return null
        } finally {
            setUploadingLogo(false)
        }
    }

    const nextStep = () => {
        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1)
        }
    }

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1)
        }
    }

    const skipStep = () => {
        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1)
        }
    }

    const saveAndFinish = async () => {
        setLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                // Upload logo first if exists
                let logoUrl = null
                if (logoFile) {
                    logoUrl = await uploadLogo(user.id)
                }

                await supabase
                    .from('profiles')
                    .update({
                        company_name: formData.companyName,
                        industry: formData.industry,
                        team_size: formData.stage,
                        avatar_url: logoUrl || undefined,
                    })
                    .eq('id', user.id)
            }
            
            const score = calculateSurveyBaseline({
                stage: formData.stage,
                industry: formData.industry,
                valueProp: formData.valueProp
            })
            setBaselineScore(score)
            
            // Start animation
            let start = 0
            const duration = 1500
            const stepTime = score > 0 ? Math.floor(duration / score) : duration
            const timer = setInterval(() => {
                start += 1
                if (start >= score) {
                    setAnimatedScore(score)
                    clearInterval(timer)
                } else {
                    setAnimatedScore(start)
                }
            }, stepTime)
            
            setCurrentStep(4)
        } catch (error) {
            console.error('Error saving:', error)
        } finally {
            setLoading(false)
        }
    }

    const goToIntegrations = () => {
        router.push('/dashboard/integrations')
    }

    const goToDashboard = () => {
        router.push('/dashboard')
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white">
            {/* Atmospheric Glow */}
            <div className="fixed top-[-40%] left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-radial-gradient pointer-events-none opacity-20" />

            {/* Header */}
            <header className="relative z-10 px-16 py-12 flex justify-between items-center border-b border-[rgba(255,255,255,0.04)]">
                <div className="font-outfit text-xs tracking-[0.4em] uppercase text-[#606060]">Velodesk</div>
                <div className="text-[0.7rem] text-[#404040] uppercase tracking-[0.15em]">
                    {timeEstimates[currentStep - 1]}
                </div>
            </header>

            {/* Progress Steps */}
            <div className="relative z-10 flex items-center justify-center gap-0 pt-16 max-w-[600px] mx-auto px-16">
                {[1, 2, 3, 4].map((step, i) => (
                    <div key={step} className="flex items-center flex-1 last:flex-none">
                        <div
                            className={`w-[10px] h-[10px] rounded-full border transition-all ${step < currentStep
                                ? 'border-[#606060] bg-[#606060]'
                                : step === currentStep
                                    ? 'border-white bg-white'
                                    : 'border-[rgba(255,255,255,0.04)] bg-transparent'
                                }`}
                        />
                        {i < 3 && (
                            <div
                                className={`flex-1 h-px mx-4 transition-all ${step < currentStep ? 'bg-[#606060]' : 'bg-[rgba(255,255,255,0.04)]'
                                    }`}
                            />
                        )}
                    </div>
                ))}
            </div>

            {/* Main Content */}
            <main className="relative z-10 flex flex-col items-center justify-center px-16 py-16">
                <div className="w-full max-w-[600px]">

                    {/* Step 1: Startup Name & Logo */}
                    {currentStep === 1 && (
                        <div className="animate-fade-in">
                            <div className="mb-16">
                                <div className="text-[0.65rem] text-[#404040] uppercase tracking-[0.3em] mb-8">Step 01</div>
                                <h1 className="font-outfit text-[3rem] font-extralight tracking-tight leading-tight mb-6">
                                    Let&apos;s name<br />your venture
                                </h1>
                                <p className="text-[#606060] text-[1.1rem] font-light leading-relaxed">
                                    What do you call the company or product you&apos;re validating?
                                </p>
                            </div>

                            <div className="mb-8">
                                <label className="block text-[0.65rem] uppercase tracking-[0.2em] text-[#606060] mb-4">
                                    Startup / Product Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.companyName}
                                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                    placeholder="e.g. Acme AI, PayFlow, EduStream"
                                    className="w-full py-6 bg-transparent border-b border-[rgba(255,255,255,0.04)] text-[1.1rem] font-light focus:outline-none focus:border-[#606060] transition placeholder:text-[#404040]"
                                />
                            </div>

                            {/* Logo Upload */}
                            <div className="mb-12">
                                <label className="block text-[0.65rem] uppercase tracking-[0.2em] text-[#606060] mb-4">
                                    Company Logo (Optional)
                                </label>
                                <p className="text-[0.75rem] text-[#404040] mb-4">
                                    This will appear on your PMF reports and data room
                                </p>

                                {logoPreview ? (
                                    <div className="relative inline-block">
                                        <div className="w-24 h-24 rounded-lg border border-white/10 overflow-hidden bg-white/5">
                                            <Image
                                                src={logoPreview}
                                                alt="Logo preview"
                                                width={96}
                                                height={96}
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                        <button
                                            onClick={removeLogo}
                                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="flex items-center gap-4 px-6 py-4 border border-dashed border-white/10 rounded-lg hover:border-white/20 hover:bg-white/[0.02] transition group"
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition">
                                            <Upload className="w-5 h-5 text-gray-500 group-hover:text-gray-400" />
                                        </div>
                                        <div className="text-left">
                                            <div className="text-sm text-gray-400">Click to upload</div>
                                            <div className="text-xs text-gray-600">PNG, JPG up to 2MB</div>
                                        </div>
                                    </button>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoSelect}
                                    className="hidden"
                                />
                            </div>

                            <div className="flex justify-between items-center pt-12 border-t border-[rgba(255,255,255,0.04)]">
                                <button
                                    onClick={skipStep}
                                    className="text-[0.75rem] text-[#404040] uppercase tracking-[0.1em] font-light hover:text-[#606060] transition"
                                >
                                    Skip for now
                                </button>
                                <button
                                    onClick={nextStep}
                                    className="text-white text-[0.85rem] uppercase tracking-[0.1em] font-medium flex items-center gap-4 hover:gap-5 transition-all"
                                >
                                    Continue <span>→</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Industry & Stage */}
                    {currentStep === 2 && (
                        <div className="animate-fade-in">
                            <div className="mb-16">
                                <div className="text-[0.65rem] text-[#404040] uppercase tracking-[0.3em] mb-8">Step 02</div>
                                <h1 className="font-outfit text-[3rem] font-extralight tracking-tight mb-6">
                                    What&apos;s your context?
                                </h1>
                                <p className="text-[#606060] text-[1.1rem] font-light leading-relaxed">
                                    Help us calibrate insights for your specific situation.
                                </p>
                            </div>

                            <div className="mb-12">
                                <label className="block text-[0.65rem] uppercase tracking-[0.2em] text-[#606060] mb-4">
                                    Industry Vertical
                                </label>
                                <select
                                    value={formData.industry}
                                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                                    className="w-full py-6 bg-transparent border-b border-[rgba(255,255,255,0.04)] text-[1.1rem] font-light focus:outline-none focus:border-[#606060] transition appearance-none cursor-pointer"
                                    title="Select your industry"
                                >
                                    <option value="" className="bg-[#050505]">Select your industry</option>
                                    {industries.map((ind) => (
                                        <option key={ind} value={ind.toLowerCase()} className="bg-[#050505]">{ind}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="mb-12">
                                <label className="block text-[0.65rem] uppercase tracking-[0.2em] text-[#606060] mb-4">
                                    Current Stage
                                </label>
                                <div className="grid grid-cols-2 gap-6">
                                    {stages.map((stage) => (
                                        <button
                                            key={stage}
                                            onClick={() => setFormData({ ...formData, stage: stage.toLowerCase() })}
                                            className={`p-8 border text-center transition font-outfit font-light text-[1rem] tracking-wide ${formData.stage === stage.toLowerCase()
                                                ? 'border-white bg-[rgba(255,255,255,0.03)]'
                                                : 'border-[rgba(255,255,255,0.04)] hover:border-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.02)]'
                                                }`}
                                        >
                                            {stage}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-between items-center pt-12 border-t border-[rgba(255,255,255,0.04)]">
                                <div className="flex gap-12">
                                    <button
                                        onClick={prevStep}
                                        className="text-[0.85rem] text-[#404040] uppercase tracking-[0.1em] font-light hover:text-[#606060] transition"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={skipStep}
                                        className="text-[0.75rem] text-[#404040] uppercase tracking-[0.1em] font-light hover:text-[#606060] transition"
                                    >
                                        Skip
                                    </button>
                                </div>
                                <button
                                    onClick={nextStep}
                                    className="text-white text-[0.85rem] uppercase tracking-[0.1em] font-medium flex items-center gap-4 hover:gap-5 transition-all"
                                >
                                    Continue <span>→</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Value Proposition */}
                    {currentStep === 3 && (
                        <div className="animate-fade-in">
                            <div className="mb-16">
                                <div className="text-[0.65rem] text-[#404040] uppercase tracking-[0.3em] mb-8">Step 03</div>
                                <h1 className="font-outfit text-[3rem] font-extralight tracking-tight mb-6">
                                    Describe your value
                                </h1>
                                <p className="text-[#606060] text-[1.1rem] font-light leading-relaxed">
                                    A brief description helps our AI provide more relevant insights.
                                </p>
                            </div>

                            <div className="mb-12">
                                <label className="block text-[0.65rem] uppercase tracking-[0.2em] text-[#606060] mb-4">
                                    Value Proposition
                                </label>
                                <textarea
                                    value={formData.valueProp}
                                    onChange={(e) => setFormData({ ...formData, valueProp: e.target.value })}
                                    placeholder="What problem are you solving, and for whom? How do you solve it differently?"
                                    rows={4}
                                    className="w-full py-6 bg-transparent border-b border-[rgba(255,255,255,0.04)] text-[1.1rem] font-light focus:outline-none focus:border-[#606060] transition placeholder:text-[#404040] resize-none leading-relaxed"
                                />
                            </div>

                            <div className="flex justify-between items-center pt-12 border-t border-[rgba(255,255,255,0.04)]">
                                <div className="flex gap-12">
                                    <button
                                        onClick={prevStep}
                                        className="text-[0.85rem] text-[#404040] uppercase tracking-[0.1em] font-light hover:text-[#606060] transition"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={skipStep}
                                        className="text-[0.75rem] text-[#404040] uppercase tracking-[0.1em] font-light hover:text-[#606060] transition"
                                    >
                                        Skip
                                    </button>
                                </div>
                                <button
                                    onClick={saveAndFinish}
                                    disabled={loading || uploadingLogo}
                                    className="text-white text-[0.85rem] uppercase tracking-[0.1em] font-medium flex items-center gap-4 hover:gap-5 transition-all disabled:opacity-50"
                                >
                                    {loading || uploadingLogo ? 'Saving...' : 'Finish Setup'} <span>→</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Success */}
                    {currentStep === 4 && (
                        <div className="animate-fade-in text-center py-8">
                            <div className="w-[120px] h-[120px] border border-[rgba(255,255,255,0.04)] rounded-full flex flex-col items-center justify-center mx-auto mb-8 bg-white/[0.02]">
                                <span className="text-[3rem] font-outfit font-light text-white leading-none">{animatedScore}</span>
                                <span className="text-[0.8rem] text-[#606060] uppercase tracking-widest mt-1">/ 35</span>
                            </div>
                            
                            <h1 className="font-outfit text-[2.5rem] font-extralight tracking-tight mb-2">
                                Your estimated PMF Score
                            </h1>
                            <p className="text-[#22c55e] text-[0.85rem] uppercase tracking-[0.1em] font-medium mb-10">
                                Survey estimate — connect your data for accuracy
                            </p>

                            <div className="text-left bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-lg p-6 mb-10 max-w-[500px] mx-auto">
                                <h3 className="text-[0.7rem] uppercase tracking-[0.2em] text-[#606060] mb-4">Priority Focus Areas</h3>
                                <div className="space-y-4">
                                    <div className="flex gap-4">
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                                        <div>
                                            <p className="text-[0.95rem] font-medium mb-1 text-white/90">Commercial Coherence</p>
                                            <p className="text-[0.85rem] text-[#606060] leading-relaxed">Unit economics and sustainable revenue path need validation.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-2 flex-shrink-0" />
                                        <div>
                                            <p className="text-[0.95rem] font-medium mb-1 text-white/90">Active Usage</p>
                                            <p className="text-[0.85rem] text-[#606060] leading-relaxed">We need data on how frequently users complete the core action.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={goToIntegrations}
                                className="inline-flex items-center justify-center w-full max-w-[400px] gap-4 px-10 py-5 bg-white text-black font-outfit font-medium text-[0.85rem] uppercase tracking-[0.1em] hover:-translate-y-0.5 hover:shadow-[0_10px_40px_rgba(255,255,255,0.1)] transition-all mb-6"
                            >
                                Connect your data to improve this score <span>→</span>
                            </button>
                            <div className="mt-2">
                                <button
                                    onClick={goToDashboard}
                                    className="text-[0.75rem] text-[#404040] uppercase tracking-[0.1em] font-light hover:text-[#606060] transition"
                                >
                                    Explore dashboard first
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
