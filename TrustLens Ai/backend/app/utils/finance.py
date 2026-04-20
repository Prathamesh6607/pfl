from math import pow


def calculate_emi(principal: float, annual_rate: float, tenure_months: int) -> float:
    monthly_rate = annual_rate / 12
    if monthly_rate <= 0:
        return principal / max(tenure_months, 1)
    numerator = principal * monthly_rate * pow(1 + monthly_rate, tenure_months)
    denominator = pow(1 + monthly_rate, tenure_months) - 1
    return numerator / max(denominator, 1e-9)


def calculate_foir(existing_emi: float, proposed_emi: float, monthly_income: float) -> float:
    if monthly_income <= 0:
        return 1.0
    return (existing_emi + proposed_emi) / monthly_income
