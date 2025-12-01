package com.ecommerce.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public class PixPaymentRequest {
    
    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.50", message = "Minimum Pix amount is R$ 0.50")
    private BigDecimal amount;
    
    @NotBlank(message = "Order ID is required")
    private String orderId;
    
    @NotNull(message = "Customer info is required")
    private CustomerInfo customerInfo;
    
    // Getters and Setters
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    
    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }
    
    public CustomerInfo getCustomerInfo() { return customerInfo; }
    public void setCustomerInfo(CustomerInfo customerInfo) { this.customerInfo = customerInfo; }
    
    public static class CustomerInfo {
        @NotBlank(message = "Customer name is required")
        private String name;
        
        @NotBlank(message = "Customer email is required")
        @Email(message = "Invalid email format")
        private String email;
        
        @NotBlank(message = "Customer CPF is required")
        private String cpf;
        
        private String phone;
        
        // Getters and Setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        
        public String getCpf() { return cpf; }
        public void setCpf(String cpf) { this.cpf = cpf; }
        
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
    }
}