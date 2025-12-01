package com.looping.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class PixPaymentResponse {
    private boolean success;
    private String clientSecret;
    private String id;
    private String pixQrCode;
    private String pixCode;
    private Long expiresAt;
    private Double amount;
    private String error;
    
    // Constructors
    public PixPaymentResponse() {}
    
    public PixPaymentResponse(boolean success, String error) {
        this.success = success;
        this.error = error;
    }
    
    // Builder methods for convenience
    public static PixPaymentResponse success() {
        PixPaymentResponse response = new PixPaymentResponse();
        response.setSuccess(true);
        return response;
    }
    
    public static PixPaymentResponse error(String error) {
        return new PixPaymentResponse(false, error);
    }
    
    // Getters and Setters
    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }
    
    public String getClientSecret() { return clientSecret; }
    public void setClientSecret(String clientSecret) { this.clientSecret = clientSecret; }
    
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getPixQrCode() { return pixQrCode; }
    public void setPixQrCode(String pixQrCode) { this.pixQrCode = pixQrCode; }
    
    public String getPixCode() { return pixCode; }
    public void setPixCode(String pixCode) { this.pixCode = pixCode; }
    
    public Long getExpiresAt() { return expiresAt; }
    public void setExpiresAt(Long expiresAt) { this.expiresAt = expiresAt; }
    
    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }
    
    public String getError() { return error; }
    public void setError(String error) { this.error = error; }
} {
    
}
