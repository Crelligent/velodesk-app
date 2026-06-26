export interface PaystackMetrics {
    mrr: number;
    activeSubscriptions: number;
    totalRevenue: number;
    churnRate: number;
}

/**
 * Fetches and calculates key metrics from a user's Paystack account
 * @param apiKey The user's Paystack Secret Key (sk_test_... or sk_live_...)
 */
export async function getPaystackMetrics(apiKey: string): Promise<PaystackMetrics | null> {
    try {
        const headers = {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        };

        // 1. Fetch Subscriptions to calculate MRR and Active Subs
        const subsResponse = await fetch('https://api.paystack.co/subscription', { headers });
        const subsData = await subsResponse.json();

        if (!subsData.status) {
            console.error('Paystack API Error:', subsData.message);
            return null;
        }

        const subscriptions = subsData.data || [];
        
        let mrr = 0;
        let activeSubscriptions = 0;
        let cancelledSubscriptions = 0;

        subscriptions.forEach((sub: any) => {
            if (sub.status === 'active') {
                activeSubscriptions++;
                // Paystack amounts are in kobo/cents. Divide by 100.
                const amount = sub.amount / 100;
                
                // Normalize to Monthly Recurring Revenue
                if (sub.plan.interval === 'monthly') {
                    mrr += amount;
                } else if (sub.plan.interval === 'annually') {
                    mrr += amount / 12;
                } else if (sub.plan.interval === 'weekly') {
                    mrr += amount * 4.33;
                }
            } else if (sub.status === 'non-renewing' || sub.status === 'cancelled') {
                cancelledSubscriptions++;
            }
        });

        // Calculate a basic churn rate (cancelled / (active + cancelled))
        const totalHistoricalSubs = activeSubscriptions + cancelledSubscriptions;
        const churnRate = totalHistoricalSubs > 0 ? (cancelledSubscriptions / totalHistoricalSubs) * 100 : 0;

        // 2. Fetch Total Transactions to calculate overall Revenue
        const txResponse = await fetch('https://api.paystack.co/transaction?status=success', { headers });
        const txData = await txResponse.json();
        
        let totalRevenue = 0;
        if (txData.status && txData.data) {
            txData.data.forEach((tx: any) => {
                totalRevenue += tx.amount / 100;
            });
        }

        return {
            mrr,
            activeSubscriptions,
            totalRevenue,
            churnRate,
        };
    } catch (error) {
        console.error('Failed to fetch Paystack metrics:', error);
        return null;
    }
}
