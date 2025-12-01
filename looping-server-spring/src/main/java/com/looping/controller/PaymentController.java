package com.looping.controller;

import com.looping.dto.PixPaymentRequest;
import com.looping.dto.PixPaymentResponse;
import com.looping.service.StripeService;
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
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8000", "http://localhost:8080"})
public class PaymentController {
    
    private static final Logger logger = LoggerFactory.getLogger(PaymentController.class);
    
    private final StripeService stripeService;
    
    @Value("${stripe.webhook-secret}")
    private String webhookSecret;
    
    public PaymentController(StripeService stripeService) {
        this.stripeService = stripeService;
    }
    
    @PostMapping("/create-pix-payment")
    public ResponseEntity<PixPaymentResponse> createPixPayment(
            @RequestBody PixPaymentRequest request) {
        
        logger.info("📦 Creating Pix payment for order: {}", request.getOrderId());
        logger.info("💰 Amount: R$ {}", request.getAmount());
        logger.info("👤 Customer: {}", request.getCustomerInfo().getEmail());
        
        try {
            PixPaymentResponse response = stripeService.createPixPayment(request);
            
            if (response.isSuccess()) {
                logger.info("✅ Pix payment created successfully: {}", response.getId());
                return ResponseEntity.ok(response);
            } else {
                logger.error("❌ Failed to create Pix payment: {}", response.getError());
                return ResponseEntity.badRequest().body(response);
            }
        } catch (Exception e) {
            logger.error("💥 Unexpected error in createPixPayment: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(new PixPaymentResponse(false, "Internal server error"));
        }
    }
    
    @GetMapping("/payment-status/{paymentIntentId}")
    public ResponseEntity<Map<String, Object>> getPaymentStatus(
            @PathVariable String paymentIntentId) {
        
        try {
            var paymentIntent = stripeService.getPaymentIntent(paymentIntentId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", paymentIntent.getStatus());
            response.put("orderId", paymentIntent.getMetadata().get("order_id"));
            response.put("amount", paymentIntent.getAmount() / 100.0);
            response.put("currency", paymentIntent.getCurrency());
            response.put("paymentIntentId", paymentIntent.getId());
            
            logger.info("Retrieved payment status: {} for payment: {}", 
                paymentIntent.getStatus(), paymentIntentId);
            
            return ResponseEntity.ok(response);
            
        } catch (StripeException e) {
            logger.error("Error retrieving payment status: {}", paymentIntentId, e);
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Failed to retrieve payment status: " + e.getMessage()
            ));
        }
    }
    
    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {
        
        logger.info("Received Stripe webhook");
        
        if (webhookSecret == null || webhookSecret.isEmpty()) {
            logger.warn("Webhook secret not configured");
            return ResponseEntity.badRequest().body("Webhook secret not configured");
        }
        
        try {
            // Verify webhook signature
            Event event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
            
            logger.info("Received Stripe webhook event: {}", event.getType());
            
            // Handle the event
            switch (event.getType()) {
                case "payment_intent.succeeded":
                    handlePaymentSucceeded(event);
                    break;
                case "payment_intent.payment_failed":
                    handlePaymentFailed(event);
                    break;
                case "payment_intent.canceled":
                    handlePaymentCanceled(event);
                    break;
                default:
                    logger.info("Unhandled event type: {}", event.getType());
            }
            
            return ResponseEntity.ok("Webhook processed successfully");
            
        } catch (Exception e) {
            logger.error("Webhook error", e);
            return ResponseEntity.badRequest().body("Webhook error: " + e.getMessage());
        }
    }
    
    private void handlePaymentSucceeded(Event event) {
        var paymentIntent = (com.stripe.model.PaymentIntent) event.getData().getObject();
        String orderId = paymentIntent.getMetadata().get("order_id");
        String paymentIntentId = paymentIntent.getId();
        
        logger.info("Payment succeeded for order: {}, payment: {}", orderId, paymentIntentId);
        
        // TODO: Update your order status in database
        // orderService.updateOrderStatus(orderId, "paid");
        // Send confirmation email, update inventory, etc.
        
        System.out.println("💰 Payment successful! Order: " + orderId + ", Amount: R$ " + (paymentIntent.getAmount() / 100.0));
    }
    
    private void handlePaymentFailed(Event event) {
        var paymentIntent = (com.stripe.model.PaymentIntent) event.getData().getObject();
        String orderId = paymentIntent.getMetadata().get("order_id");
        
        logger.warn("Payment failed for order: {}", orderId);
        
        // TODO: Update order status to failed
        // orderService.updateOrderStatus(orderId, "failed");
        
        System.out.println("❌ Payment failed for order: " + orderId);
    }
    
    private void handlePaymentCanceled(Event event) {
        var paymentIntent = (com.stripe.model.PaymentIntent) event.getData().getObject();
        String orderId = paymentIntent.getMetadata().get("order_id");
        
        logger.info("Payment canceled for order: {}", orderId);
        
        // TODO: Update order status to canceled
        // orderService.updateOrderStatus(orderId, "canceled");
        
        System.out.println("🚫 Payment canceled for order: " + orderId);
    }
    
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        return ResponseEntity.ok(Map.of("status", "OK", "service", "Payment API"));
    }
}