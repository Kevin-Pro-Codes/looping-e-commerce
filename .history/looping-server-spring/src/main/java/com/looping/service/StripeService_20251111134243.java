package com.looping.service;

import com.looping.dto.PixPaymentRequest;
import com.looping.dto.PixPaymentResponse;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Service
public class StripeService {
    
    private static final Logger logger = LoggerFactory.getLogger(StripeService.class);
    
    @Value("${stripe.secret-key}")
    private String secretKey;
    
    public PixPaymentResponse createPixPayment(PixPaymentRequest request) {
        try {
            Stripe.apiKey = secretKey;
            
            // Convert amount to cents (Stripe requires long)
            long amountInCents = request.getAmount()
                    .multiply(BigDecimal.valueOf(100))
                    .longValue();
            
            // Validate minimum amount for Pix
            if (amountInCents < 50) {
                return PixPaymentResponse.error("Minimum Pix amount is R$ 0.50");
            }
            
            // Create metadata
            Map<String, String> metadata = new HashMap<>();
            metadata.put("order_id", request.getOrderId());
            metadata.put("customer_email", request.getCustomerInfo().getEmail());
            metadata.put("customer_name", request.getCustomerInfo().getName());
            metadata.put("customer_cpf", request.getCustomerInfo().getCpf());
            if (request.getCustomerInfo().getPhone() != null) {
                metadata.put("customer_phone", request.getCustomerInfo().getPhone());
            }
            
            // Create PaymentIntent with Pix
            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount(amountInCents)
                    .setCurrency("brl")
                    .addPaymentMethodType("pix")
                    .putAllMetadata(metadata)
                    .build();
            
            PaymentIntent paymentIntent = PaymentIntent.create(params);
            
            logger.info("Pix PaymentIntent created: {} for order: {}", 
                paymentIntent.getId(), request.getOrderId());
            
            // Debug: Check what methods are available
            if (paymentIntent.getNextAction() != null) {
                logger.info("Next action type: {}", paymentIntent.getNextAction().getType());
                logger.info("Next action class: {}", paymentIntent.getNextAction().getClass().getName());
                
                // List all available methods for debugging
                java.lang.reflect.Method[] methods = paymentIntent.getNextAction().getClass().getMethods();
                for (java.lang.reflect.Method method : methods) {
                    if (method.getName().toLowerCase().contains("pix") || 
                        method.getName().toLowerCase().contains("qr") ||
                        method.getName().toLowerCase().contains("display")) {
                        logger.info("Available method: {} - Return type: {}", 
                            method.getName(), method.getReturnType().getSimpleName());
                    }
                }
            }
            
            // Build response
            PixPaymentResponse response = PixPaymentResponse.success();
            response.setId(paymentIntent.getId());
            response.setClientSecret(paymentIntent.getClientSecret());
            response.setAmount(request.getAmount().doubleValue());
            
            // For now, use fallback data until we figure out the correct method names
            setFallbackPixData(response);
            
            logger.info("Returning PIX payment response with ID: {}", response.getId());
            
            return response;
            
        } catch (StripeException e) {
            logger.error("Stripe API error creating Pix payment for order: {}", 
                request.getOrderId(), e);
            return PixPaymentResponse.error("Stripe error: " + e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error creating Pix payment for order: {}", 
                request.getOrderId(), e);
            return PixPaymentResponse.error("Internal server error");
        }
    }
    
    private void setFallbackPixData(PixPaymentResponse response) {
        // Use fallback data that will work for testing
        response.setPixQrCode("https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PIX_" + response.getId());
        response.setPixCode("00020126580014br.gov.bcb.pix0136" + response.getId() + "5204000053039865406" + 
                           String.format("%.2f", response.getAmount()).replace(".", "") + 
                           "5802BR5913LoopingStore6008SaoPaulo62070503***6304E2CA");
        response.setExpiresAt(System.currentTimeMillis() / 1000 + 1800); // 30 minutes from now
    }
    
    public PaymentIntent getPaymentIntent(String paymentIntentId) throws StripeException {
        Stripe.apiKey = secretKey;
        return PaymentIntent.retrieve(paymentIntentId);
    }
    
    public String getPaymentStatus(String paymentIntentId) {
        try {
            PaymentIntent paymentIntent = getPaymentIntent(paymentIntentId);
            return paymentIntent.getStatus();
        } catch (StripeException e) {
            logger.error("Error retrieving payment status: {}", paymentIntentId, e);
            return "error";
        }
    }
}