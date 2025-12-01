package com.ecommerce.controller;

import com.ecommerce.dto.PixPaymentRequest;
import com.ecommerce.dto.PixPaymentResponse;
import com.ecommerce.service.StripeService;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.net.Webhook;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8000"})
public class PaymentController {
    
    private static final Logger logger = LoggerFactory.getLogger(PaymentController.class);
    
    private final StripeService stripeService;
    
    @Value("${stripe.webhook-secret}")
    private String webhookSecret;
    
    public PaymentController(StripeService stripeService) {
        this.stripeService = stripeService;
    }
    
    // ✅ Health check endpoint
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        logger.info("Health check endpoint called");
        Map<String, String> response = new HashMap<>();
        response.put("status", "OK");
        response.put("service", "Payment API");
        response.put("timestamp", java.time.LocalDateTime.now().toString());
        return ResponseEntity.ok(response);
    }
    
    // ✅ Create Pix Payment endpoint
    @PostMapping("/create-pix-payment")
    public ResponseEntity<PixPaymentResponse> createPixPayment(
            @Valid @RequestBody PixPaymentRequest request) {
        
        logger.info("📦 Creating Pix payment for order: {}", request.getOrderId());
        logger.info("💰 Amount: R$ {}", request.getAmount());
        
        PixPaymentResponse response = stripeService.createPixPayment(request);
        
        if (response.isSuccess()) {
            logger.info("✅ Pix payment created successfully for order: {}", request.getOrderId());
            return ResponseEntity.ok(response);
        } else {
            logger.error("❌ Failed to create Pix payment for order: {} - {}", 
                request.getOrderId(), response.getError());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    // ✅ Get Payment Status endpoint
    @GetMapping("/payment-status/{paymentIntentId}")
    public ResponseEntity<Map<String, Object>> getPaymentStatus(
            @PathVariable String paymentIntentId) {
        
        logger.info("🔍 Checking payment status for: {}", paymentIntentId);
        
        try {
            var paymentIntent = stripeService.getPaymentIntent(paymentIntentId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", paymentIntent.getStatus());
            response.put("orderId", paymentIntent.getMetadata().get("order_id"));
            response.put("amount", paymentIntent.getAmount() / 100.0);
            response.put("currency", paymentIntent.getCurrency());
            response.put("paymentIntentId", paymentIntent.getId());
            
            logger.info("📊 Payment status: {} for payment: {}", 
                paymentIntent.getStatus(), paymentIntentId);
            
            return ResponseEntity.ok(response);
            
        } catch (StripeException e) {
            logger.error("❌ Error retrieving payment status: {}", paymentIntentId, e);
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Failed to retrieve payment status: " + e.getMessage()
            ));
        }
    }
    
    // ✅ Webhook endpoint
    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {
        
        logger.info("📩 Received Stripe webhook");
        
        try {
            Event event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
            logger.info("✅ Webhook event processed: {}", event.getType());
            return ResponseEntity.ok("Webhook processed successfully");
            
        } catch (Exception e) {
            logger.error("❌ Webhook error", e);
            return ResponseEntity.badRequest().body("Webhook error: " + e.getMessage());
        }
    }
}