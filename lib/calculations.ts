export interface CalculationResult {
    tax: number;
    retirement: number;
    safe: number;
}

export function calculateSafetyMoves(
    amount: number,
    taxRate: number = 30,
    retirementRate: number = 10
): CalculationResult {
    const tax = (amount * taxRate) / 100;
    const retirement = (amount * retirementRate) / 100;
    const safe = amount - tax - retirement;

    return {
        tax: Math.round(tax * 100) / 100,
        retirement: Math.round(retirement * 100) / 100,
        safe: Math.round(safe * 100) / 100,
    };
}

export function calculateSafeToSpend(
    totalBalance: number,
    pendingTax: number,
    pendingRetirement: number
): number {
    return totalBalance - pendingTax - pendingRetirement;
}
