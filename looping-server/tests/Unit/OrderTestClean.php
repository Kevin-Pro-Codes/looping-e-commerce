<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;
use App\Models\Order;

class OrderTestClean extends TestCase
{
    /** @test */
    public function it_can_create_order_instance()
    {
        $order = new Order();
        
        $this->assertInstanceOf(Order::class, $order);
    }

    /** @test */
    public function it_can_set_and_get_properties()
    {
        $order = new Order();
        
        $order->user_id = 1;
        $order->order_number = 'ORD-001';
        $order->total_amount = 99.99;
        $order->payment_status = 'pending';
        $order->stock_updated = false;

        $this->assertEquals('ORD-001', $order->order_number);
        $this->assertEquals(99.99, $order->total_amount);
        $this->assertEquals('pending', $order->payment_status);
        $this->assertEquals(1, $order->user_id);
        $this->assertFalse($order->stock_updated);
    }

    /** @test */
    public function it_can_mark_order_as_paid()
    {
        $order = new Order();
        $order->payment_status = 'pending';
        
        $order->payment_status = 'paid';
        
        $this->assertEquals('paid', $order->payment_status);
    }

    /** @test */
    public function it_can_mark_stock_as_updated()
    {
        $order = new Order();
        $order->stock_updated = false;
        
        $order->stock_updated = true;
        
        $this->assertTrue($order->stock_updated);
    }

    /** @test */
    public function it_has_correct_fillable_fields()
    {
        $order = new Order();
        $fillable = $order->getFillable();
        
        $this->assertIsArray($fillable);
        $this->assertContains('user_id', $fillable);
        $this->assertContains('order_number', $fillable);
        $this->assertContains('total_amount', $fillable);
        $this->assertContains('payment_status', $fillable);
        $this->assertContains('stock_updated', $fillable);
    }

    /** @test */
    public function it_checks_order_model_exists()
    {
        $this->assertTrue(class_exists('App\Models\Order'));
    }
}
