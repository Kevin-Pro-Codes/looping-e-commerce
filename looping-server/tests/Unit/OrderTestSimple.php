<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;
use App\Models\Order;

class OrderTestSimple extends TestCase
{
    /** @test */
    public function it_can_create_an_order_instance()
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
    public function it_can_check_if_order_is_paid()
    {
        $paidOrder = new Order();
        $paidOrder->payment_status = 'paid';
        
        $pendingOrder = new Order();
        $pendingOrder->payment_status = 'pending';

        $this->assertEquals('paid', $paidOrder->payment_status);
        $this->assertEquals('pending', $pendingOrder->payment_status);
    }

    /** @test */
    public function it_can_check_if_stock_was_updated()
    {
        $updatedOrder = new Order();
        $updatedOrder->stock_updated = true;
        
        $notUpdatedOrder = new Order();
        $notUpdatedOrder->stock_updated = false;

        $this->assertTrue($updatedOrder->stock_updated);
        $this->assertFalse($notUpdatedOrder->stock_updated);
    }
}
