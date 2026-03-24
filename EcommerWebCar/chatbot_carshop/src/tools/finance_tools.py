def calculate_loan(car_price, down_payment_percent, years, interest_rate=0.08):
    """Tính toán số tiền trả góp hàng tháng cho khách hàng."""
    loan_amount = car_price * (1 - down_payment_percent/100)
    monthly_rate = interest_rate / 12
    months = years * 12
    monthly_payment = (loan_amount * monthly_rate) / (1 - (1 + monthly_rate)**(-months))
    return f"Với giá xe {car_price:,}đ, trả trước {down_payment_percent}%, bạn sẽ trả khoảng {int(monthly_payment):,}đ/tháng trong {years} năm."