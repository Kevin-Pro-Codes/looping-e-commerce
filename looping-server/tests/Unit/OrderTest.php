<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

class OrderTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_can_create_an_order()
    {
        $order = Order::factory()->create([
            'order_number' => 'ORD-001',
            'total' => 99.99,
            'payment_status' => 'pending',
            'customer_name' => 'Test Customer',
            'customer_email' => 'test@example.com',
        ]);

        $this->assertEquals('ORD-001', $order->order_number);
        $this->assertEquals(99.99, $order->total);
        $this->assertEquals('pending', $order->payment_status);
        $this->assertEquals('Test Customer', $order->customer_name);
    }

    /** @test */
    public function it_can_mark_order_as_paid()
    {
        $order = Order::factory()->create(['payment_status' => 'pending']);
        
        $order->update(['payment_status' => 'paid']);
        
        $this->assertEquals('paid', $order->payment_status);
    }

    /** @test */
    public function it_can_mark_stock_as_updated()
    {
        $order = Order::factory()->create(['stock_updated' => false]);
        
        $order->update(['stock_updated' => true]);
        
        $this->assertTrue($order->stock_updated);
    }

    /** @test */
    public function it_has_correct_fillable_fields()
    {
        $orderData = [
            'order_number' => 'ORD-002',
            'total' => 149.99,
            'subtotal' => 129.99,
            'shipping' => 10.00,
            'discount' => 0.00,
            'payment_status' => 'paid',
            'stock_updated' => true,
            'customer_name' => 'Test Customer',
            'customer_email' => 'test@example.com',
            'customer_phone' => '1234567890',
            'customer_cpf' => '12345678901',
            'payment_method' => 'credit_card',
            'status' => 'processing',
            'shipping_street' => '123 Test St',
            'shipping_number' => '456',
            'shipping_neighborhood' => 'Test District',
            'shipping_city' => 'Test City',
            'shipping_state' => 'TS',
            'shipping_zip_code' => '12345',
            'items' => json_encode([['id' => 1, 'name' => 'Test Product', 'price' => 129.99, 'quantity' => 1]]),
        ];

        $order = Order::create($orderData);

        foreach ($orderData as $key => $value) {
            $this->assertEquals($value, $order->$key);
        }
    }

    /** @test */
    public function it_can_check_if_order_is_paid()
    {
        $paidOrder = Order::factory()->create(['payment_status' => 'paid']);
        $pendingOrder = Order::factory()->create(['payment_status' => 'pending']);

        $this->assertEquals('paid', $paidOrder->payment_status);
        $this->assertEquals('pending', $pendingOrder->payment_status);
    }

    /** @test */
    public function it_can_check_if_stock_was_updated()
    {
        $updatedOrder = Order::factory()->create(['stock_updated' => true]);
        $notUpdatedOrder = Order::factory()->create(['stock_updated' => false]);

        $this->assertTrue($updatedOrder->stock_updated);
        $this->assertFalse($notUpdatedOrder->stock_updated);
    }
}
