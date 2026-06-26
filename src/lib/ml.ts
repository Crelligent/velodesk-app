/**
 * Velodesk ML Module
 * Lead scoring, churn prediction, revenue projections, and adoption forecasting
 */

// =================== TYPES ===================

export interface Lead {
    pageViews?: number
    emailOpens?: number
    emailClicks?: number
    avgSessionDuration?: number
    companySize?: string
    industry?: string
    role?: string
    pricingPageViews?: number
    demoRequested?: boolean
    trialStarted?: boolean
    featuresViewed?: number
    daysSinceLastActivity?: number
    returnVisits?: number
    contentDownloads?: number
}

export interface LeadScoreResult {
    score: number
    priority: 'hot' | 'high' | 'medium' | 'low'
    factors: {
        engagement: number
        companyFit: number
        intentSignals: number
        recency: number
        behavior: number
    }
    nextAction: {
        action: string
        type: 'call' | 'email' | 'automation'
        urgency: 'high' | 'medium' | 'low'
    }
    confidence: number
}

export interface ChurnPrediction {
    probability: number
    riskLevel: 'critical' | 'high' | 'medium' | 'low'
    riskScore: number
    riskFactors: Array<{ factor: string; impact: 'high' | 'medium' | 'low' }>
    suggestions: string[]
}

export interface RevenueProjection {
    projections: Array<{
        month: number
        customers: { starter: number; growth: number; scale: number }
        totalCustomers: number
        newSignups: number
        mrr: number
        arr: number
        acquisitionCost: number
        ltv: number
        ltvCacRatio: number
    }>
    summary: {
        finalMRR: number
        finalARR: number
        totalCustomers: number
        avgLTV: number
        ltvCacRatio: number
        breakEvenMonth: number | string
    }
    chartData: {
        labels: string[]
        mrr: number[]
        customers: number[]
        arr: number[]
    }
}

export interface AdoptionForecast {
    forecasts: Array<{
        period: number
        newAdopters: number
        cumulativeAdopters: number
        adoptionRate: string
        confidence: { lower: number; upper: number; level: number }
    }>
    summary: {
        totalAdopted: number
        marketPenetration: string
        peakAdoptionPeriod: number
        timeToMajority: number | string
    }
    chartData: {
        labels: string[]
        cumulative: number[]
        new: number[]
        lower: number[]
        upper: number[]
    }
}

// =================== LEAD SCORING ===================

function getCompanySizeScore(size?: string): number {
    const scores: Record<string, number> = {
        'enterprise': 10,
        '1000+': 10,
        '500-1000': 9,
        '200-500': 8,
        '100-200': 7,
        '50-100': 6,
        '20-50': 5,
        '10-20': 4,
        '1-10': 3,
        'startup': 5,
        'unknown': 2
    }
    return scores[size?.toLowerCase() || ''] || 2
}

function getIndustryScore(industry?: string): number {
    const highFit = ['saas', 'technology', 'software', 'fintech', 'b2b']
    const mediumFit = ['edtech', 'healthtech', 'ecommerce', 'marketplace']

    const ind = industry?.toLowerCase() || ''
    if (highFit.includes(ind)) return 10
    if (mediumFit.includes(ind)) return 7
    return 4
}

function getRoleScore(role?: string): number {
    const highValue = ['founder', 'ceo', 'cto', 'cpo', 'vp product', 'head of product']
    const mediumValue = ['product manager', 'director', 'lead', 'manager']

    const roleLower = role?.toLowerCase() || ''
    if (highValue.some(r => roleLower.includes(r))) return 5
    if (mediumValue.some(r => roleLower.includes(r))) return 3
    return 1
}

function getNextBestAction(
    lead: Lead,
    factors: LeadScoreResult['factors'],
    score: number
): LeadScoreResult['nextAction'] {
    if (score >= 75 && !lead.demoRequested) {
        return { action: 'Schedule Demo', type: 'call', urgency: 'high' }
    }
    if (factors.intentSignals < 10 && factors.engagement > 15) {
        return { action: 'Send Case Study', type: 'email', urgency: 'medium' }
    }
    if (factors.recency < 5 && score >= 50) {
        return { action: 'Re-engage Email', type: 'email', urgency: 'high' }
    }
    if (!lead.trialStarted && score >= 40) {
        return { action: 'Offer Trial', type: 'email', urgency: 'medium' }
    }
    if (factors.companyFit > 15 && factors.engagement < 10) {
        return { action: 'Send Personalized Content', type: 'email', urgency: 'low' }
    }
    return { action: 'Nurture Sequence', type: 'automation', urgency: 'low' }
}

function calculateConfidence(lead: Lead): number {
    let dataPoints = 0
    if (lead.pageViews) dataPoints++
    if (lead.emailOpens) dataPoints++
    if (lead.companySize) dataPoints++
    if (lead.industry) dataPoints++
    if (lead.role) dataPoints++
    if (lead.daysSinceLastActivity !== undefined) dataPoints++

    return Math.min(0.95, 0.4 + (dataPoints * 0.1))
}

export function calculateLeadScore(lead: Lead): LeadScoreResult {
    const factors = {
        engagement: 0,
        companyFit: 0,
        intentSignals: 0,
        recency: 0,
        behavior: 0
    }

    // Engagement Score (0-25 points)
    const pageViews = lead.pageViews || 0
    const emailOpens = lead.emailOpens || 0
    const emailClicks = lead.emailClicks || 0
    const sessionDuration = lead.avgSessionDuration || 0

    factors.engagement = Math.min(25,
        Math.min(pageViews * 1.5, 8) +
        Math.min(emailOpens * 2, 6) +
        Math.min(emailClicks * 3, 6) +
        Math.min(sessionDuration / 60, 5)
    )

    // Company Fit Score (0-25 points)
    factors.companyFit = Math.min(25,
        getCompanySizeScore(lead.companySize) +
        getIndustryScore(lead.industry) +
        getRoleScore(lead.role)
    )

    // Intent Signals (0-25 points)
    const pricingViews = lead.pricingPageViews || 0
    factors.intentSignals = Math.min(25,
        Math.min(pricingViews * 4, 10) +
        (lead.demoRequested ? 8 : 0) +
        (lead.trialStarted ? 5 : 0) +
        Math.min((lead.featuresViewed || 0) * 0.5, 2)
    )

    // Recency Score (0-15 points)
    const daysSinceActivity = lead.daysSinceLastActivity || 30
    factors.recency = Math.max(0, 15 - (daysSinceActivity * 0.5))

    // Behavior Score (0-10 points)
    factors.behavior = Math.min(10,
        Math.min((lead.returnVisits || 0) * 2, 5) +
        Math.min((lead.contentDownloads || 0) * 2.5, 5)
    )

    // Calculate total score
    const totalScore = Math.round(
        factors.engagement + factors.companyFit + factors.intentSignals + factors.recency + factors.behavior
    )

    // Determine priority
    let priority: LeadScoreResult['priority'] = 'low'
    if (totalScore >= 75) priority = 'hot'
    else if (totalScore >= 50) priority = 'high'
    else if (totalScore >= 30) priority = 'medium'

    return {
        score: Math.min(100, totalScore),
        priority,
        factors,
        nextAction: getNextBestAction(lead, factors, totalScore),
        confidence: calculateConfidence(lead)
    }
}

// =================== CHURN PREDICTION ===================

interface ChurnInput {
    daysSinceLogin?: number
    loginFrequency?: number
    featureUsage?: number
    supportTickets?: number
    npsScore?: number | null
    paymentIssues?: number
    planDowngrade?: boolean
    accountAge?: number
}

function getRetentionSuggestions(riskFactors: ChurnPrediction['riskFactors']): string[] {
    const suggestions: string[] = []

    riskFactors.forEach(rf => {
        if (rf.factor.includes('Inactive')) {
            suggestions.push('Send re-engagement email with new feature highlights')
        }
        if (rf.factor.includes('login frequency')) {
            suggestions.push('Schedule a check-in call to understand needs')
        }
        if (rf.factor.includes('feature adoption')) {
            suggestions.push('Offer personalized onboarding session')
        }
        if (rf.factor.includes('support tickets')) {
            suggestions.push('Escalate to customer success for proactive outreach')
        }
        if (rf.factor.includes('NPS')) {
            suggestions.push('Request feedback call to address concerns')
        }
    })

    return suggestions.slice(0, 3)
}

export function predictChurn(userData: ChurnInput): ChurnPrediction {
    const {
        daysSinceLogin = 0,
        loginFrequency = 0,
        featureUsage = 0,
        supportTickets = 0,
        npsScore = null,
        paymentIssues = 0,
        planDowngrade = false,
        accountAge = 30
    } = userData

    let riskScore = 0
    const riskFactors: ChurnPrediction['riskFactors'] = []

    // Inactivity risk
    if (daysSinceLogin > 14) {
        riskScore += 25
        riskFactors.push({ factor: 'Inactive for 2+ weeks', impact: 'high' })
    } else if (daysSinceLogin > 7) {
        riskScore += 15
        riskFactors.push({ factor: 'Inactive for 1+ week', impact: 'medium' })
    }

    // Low engagement
    if (loginFrequency < 1) {
        riskScore += 20
        riskFactors.push({ factor: 'Low login frequency', impact: 'high' })
    }

    // Feature adoption
    if (featureUsage < 20) {
        riskScore += 15
        riskFactors.push({ factor: 'Low feature adoption', impact: 'medium' })
    }

    // Support issues
    if (supportTickets > 3) {
        riskScore += 15
        riskFactors.push({ factor: 'Multiple support tickets', impact: 'medium' })
    }

    // NPS detractor
    if (npsScore !== null && npsScore < 7) {
        riskScore += 20
        riskFactors.push({ factor: 'Low NPS score', impact: 'high' })
    }

    // Payment issues
    if (paymentIssues > 0) {
        riskScore += 15
        riskFactors.push({ factor: 'Payment issues', impact: 'medium' })
    }

    // Plan downgrade
    if (planDowngrade) {
        riskScore += 10
        riskFactors.push({ factor: 'Recent plan downgrade', impact: 'medium' })
    }

    // Account age adjustment
    if (accountAge < 30) {
        riskScore = Math.round(riskScore * 1.2)
    } else if (accountAge > 180) {
        riskScore = Math.round(riskScore * 0.8)
    }

    const probability = Math.min(0.95, riskScore / 100)

    return {
        probability,
        riskLevel: probability > 0.7 ? 'critical' : probability > 0.4 ? 'high' : probability > 0.2 ? 'medium' : 'low',
        riskScore: Math.min(100, riskScore),
        riskFactors,
        suggestions: getRetentionSuggestions(riskFactors)
    }
}

// =================== REVENUE PROJECTIONS ===================

interface RevenueInput {
    pricing?: { starter: number; growth: number; scale: number }
    marketSize?: number
    conversionRate?: number
    churnRate?: number
    growthRate?: number
    cac?: number
    months?: number
}

export function projectRevenue(inputs: RevenueInput): RevenueProjection {
    const {
        pricing = { starter: 0, growth: 29, scale: 99 },
        marketSize = 10000,
        conversionRate = 0.02,
        churnRate = 0.05,
        growthRate = 0.15,
        cac = 50,
        months = 12
    } = inputs

    const projections: RevenueProjection['projections'] = []
    const customers = { starter: 0, growth: 0, scale: 0 }

    for (let month = 1; month <= months; month++) {
        const marketReach = marketSize * Math.pow(1 + growthRate / 12, month)
        const newSignups = Math.round(marketReach * conversionRate / 12)

        const newStarter = Math.round(newSignups * 0.6)
        const newGrowth = Math.round(newSignups * 0.3)
        const newScale = Math.round(newSignups * 0.1)

        customers.starter = Math.round(customers.starter * (1 - churnRate / 12)) + newStarter
        customers.growth = Math.round(customers.growth * (1 - churnRate / 12)) + newGrowth
        customers.scale = Math.round(customers.scale * (1 - churnRate / 12)) + newScale

        const totalCustomers = customers.starter + customers.growth + customers.scale

        const mrr = (customers.starter * pricing.starter) +
            (customers.growth * pricing.growth) +
            (customers.scale * pricing.scale)

        const arr = mrr * 12
        const acquisitionCost = newSignups * cac
        const ltv = mrr / (churnRate || 0.01)

        projections.push({
            month,
            customers: { ...customers },
            totalCustomers,
            newSignups,
            mrr,
            arr,
            acquisitionCost,
            ltv,
            ltvCacRatio: ltv / cac
        })
    }

    const finalMonth = projections[projections.length - 1]
    const breakEvenMonth = projections.findIndex(p =>
        p.mrr * (1 / (churnRate || 0.01)) > p.acquisitionCost * 12
    ) + 1

    return {
        projections,
        summary: {
            finalMRR: finalMonth.mrr,
            finalARR: finalMonth.arr,
            totalCustomers: finalMonth.totalCustomers,
            avgLTV: finalMonth.ltv,
            ltvCacRatio: finalMonth.ltvCacRatio,
            breakEvenMonth: breakEvenMonth > 0 ? breakEvenMonth : 'N/A'
        },
        chartData: {
            labels: projections.map(p => `Month ${p.month}`),
            mrr: projections.map(p => p.mrr),
            customers: projections.map(p => p.totalCustomers),
            arr: projections.map(p => p.arr)
        }
    }
}

// =================== ADOPTION FORECASTING (BASS MODEL) ===================

interface AdoptionInput {
    marketPotential?: number
    innovationCoeff?: number
    imitationCoeff?: number
    periods?: number
}

export function forecastAdoption(params: AdoptionInput): AdoptionForecast {
    const {
        marketPotential = 10000,
        innovationCoeff = 0.03,
        imitationCoeff = 0.38,
        periods = 12
    } = params

    const forecasts: AdoptionForecast['forecasts'] = []
    let cumulativeAdopters = 0

    for (let t = 1; t <= periods; t++) {
        const F_t = cumulativeAdopters / marketPotential
        const adoptionRate = (innovationCoeff + imitationCoeff * F_t) * (1 - F_t)
        const newAdopters = Math.round(marketPotential * adoptionRate)

        cumulativeAdopters += newAdopters

        const uncertaintyFactor = 1 + (t * 0.02)
        const lowerBound = Math.round(cumulativeAdopters / uncertaintyFactor)
        const upperBound = Math.round(cumulativeAdopters * uncertaintyFactor)

        forecasts.push({
            period: t,
            newAdopters,
            cumulativeAdopters: Math.min(cumulativeAdopters, marketPotential),
            adoptionRate: (cumulativeAdopters / marketPotential * 100).toFixed(1),
            confidence: {
                lower: lowerBound,
                upper: upperBound,
                level: 0.8 - (t * 0.02)
            }
        })
    }

    const peakPeriod = forecasts.reduce((max, f) =>
        f.newAdopters > (max?.newAdopters || 0) ? f : max, forecasts[0])

    return {
        forecasts,
        summary: {
            totalAdopted: forecasts[forecasts.length - 1].cumulativeAdopters,
            marketPenetration: forecasts[forecasts.length - 1].adoptionRate + '%',
            peakAdoptionPeriod: peakPeriod?.period || 1,
            timeToMajority: forecasts.findIndex(f =>
                f.cumulativeAdopters >= marketPotential * 0.5) + 1 || 'Beyond forecast'
        },
        chartData: {
            labels: forecasts.map(f => `Period ${f.period}`),
            cumulative: forecasts.map(f => f.cumulativeAdopters),
            new: forecasts.map(f => f.newAdopters),
            lower: forecasts.map(f => f.confidence.lower),
            upper: forecasts.map(f => f.confidence.upper)
        }
    }
}

// =================== UTILITY FUNCTIONS ===================

export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount)
}

export function formatPercent(value: number): string {
    return (value * 100).toFixed(1) + '%'
}

export function generateConfidenceInterval(value: number, confidence = 0.8) {
    const variance = (1 - confidence) * value
    return {
        lower: Math.round(value - variance),
        upper: Math.round(value + variance),
        confidence
    }
}

// =================== PMF SCORING & BASELINE ===================

export interface PMFMetrics {
    weekFourRetention?: number
    fullPriceConversion?: number
    organicAcquisitionRate?: number
    coreActionCompletionRate?: number
    timeToFirstUse?: number
    churnToAlternativeRate?: number
    contributionMargin?: number
    industryVertical?: string
}

export interface PMFResult {
    totalScore: number
    dimensions: Record<string, number>
    status: 'PRE_PMF' | 'WEAK_SIGNAL' | 'DEVELOPING_PMF' | 'STRONG_PMF'
    criticalGaps: string[]
    interventions: string[]
}

function scoreRetention(value = 0): number {
    if (value > 0.40) return 5
    if (value > 0.25) return 4
    if (value > 0.15) return 3
    if (value > 0.05) return 2
    return 1
}

function scoreWTP(value = 0): number {
    if (value > 0.80) return 5
    if (value > 0.60) return 4
    if (value > 0.40) return 3
    if (value > 0.20) return 2
    return 1
}

function scoreOrganic(value = 0): number {
    if (value > 0.30) return 5
    if (value > 0.20) return 4
    if (value > 0.10) return 3
    if (value > 0.05) return 2
    return 1
}

function scoreUsage(value = 0): number {
    if (value > 0.70) return 5
    if (value > 0.50) return 4
    if (value > 0.30) return 3
    if (value > 0.15) return 2
    return 1
}

function scoreUrgency(days = 30): number {
    if (days <= 1) return 5
    if (days <= 3) return 4
    if (days <= 7) return 3
    if (days <= 14) return 2
    return 1
}

function scoreSubs(rate = 1): number {
    if (rate < 0.10) return 5
    if (rate < 0.20) return 4
    if (rate < 0.40) return 3
    if (rate < 0.60) return 2
    return 1
}

function scoreCommercial(margin = -1): number {
    if (margin > 0.50) return 5
    if (margin > 0) return 4
    if (margin > -0.20) return 3
    if (margin > -0.50) return 2
    return 1
}

function identifyCriticalGaps(dimensions: Record<string, number>): string[] {
    return Object.entries(dimensions)
        .filter(([_, score]) => score <= 1)
        .map(([key]) => key)
}

function generateInterventions(dimensions: Record<string, number>, industry?: string): string[] {
    const gaps = identifyCriticalGaps(dimensions)
    const interventions: string[] = []

    if (gaps.includes('retention')) {
        interventions.push('Fix leaky bucket: cohort analysis to identify exactly when users drop off in week 1-4.')
    }
    if (gaps.includes('willingnessToPay')) {
        interventions.push('Interview users who refused to pay: is the problem the price point or the perceived value?')
    }
    if (gaps.includes('urgency')) {
        interventions.push(`Value prop tweak: For ${industry || 'your sector'}, reposition the product as a painkiller rather than a vitamin.`)
    }
    if (gaps.includes('commercialCoherence')) {
        interventions.push('Review unit economics: Current pricing/cost structure is unsustainable at scale.')
    }
    if (gaps.length === 0) {
        interventions.push('No critical gaps. Focus on scaling your most efficient acquisition channel.')
    }

    return interventions
}

export function calculatePMFScore(metrics: PMFMetrics): PMFResult {
    const dimensions = {
        retention: scoreRetention(metrics.weekFourRetention),
        willingnessToPay: scoreWTP(metrics.fullPriceConversion),
        organicGrowth: scoreOrganic(metrics.organicAcquisitionRate),
        activeUsage: scoreUsage(metrics.coreActionCompletionRate),
        urgency: scoreUrgency(metrics.timeToFirstUse),
        substituteResistance: scoreSubs(metrics.churnToAlternativeRate),
        commercialCoherence: scoreCommercial(metrics.contributionMargin),
    }

    const weights = {
        retention: 0.20,
        willingnessToPay: 0.20,
        organicGrowth: 0.15,
        activeUsage: 0.15,
        urgency: 0.15,
        substituteResistance: 0.10,
        commercialCoherence: 0.05,
    }

    const weightedScore = Object.entries(dimensions).reduce((total, [key, score]) => {
        // (score / 5) * weight * 35 gives the points out of the weighted maximum
        return total + ((score / 5) * weights[key as keyof typeof weights] * 35)
    }, 0)

    const roundedScore = Math.round(weightedScore)
    let status: PMFResult['status'] = 'PRE_PMF'
    if (roundedScore >= 28) status = 'STRONG_PMF'
    else if (roundedScore >= 21) status = 'DEVELOPING_PMF'
    else if (roundedScore >= 14) status = 'WEAK_SIGNAL'

    return {
        totalScore: roundedScore,
        dimensions,
        status,
        criticalGaps: identifyCriticalGaps(dimensions),
        interventions: generateInterventions(dimensions, metrics.industryVertical),
    }
}

export interface OnboardingProfile {
    stage: string
    industry: string
    valueProp: string
}

export function calculateSurveyBaseline(profile: OnboardingProfile): number {
    let score = 0

    // Stage contribution
    const stageStr = profile.stage?.toLowerCase() || ''
    if (stageStr === 'ideation') score += 3
    else if (stageStr === 'mvp') score += 8
    else if (stageStr === 'growth') score += 16
    else if (stageStr === 'scaling') score += 22
    else score += 3

    // Industry modifier
    const industryStr = profile.industry?.toLowerCase() || ''
    if (['fintech', 'saas / b2b'].includes(industryStr)) {
        score -= 2 
    }

    // Value Prop quality
    const vpLength = profile.valueProp?.length || 0
    if (vpLength > 100) score += 3
    else if (vpLength > 50) score += 1

    return Math.max(0, Math.min(35, score))
}
