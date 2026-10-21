<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Services\OrderStockService;
use App\Models\Stock;
use App\Models\Order;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Mockery;

class OrderStockServiceTest extends TestCase
{
    private OrderStockService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new OrderStockService();
    }

    /** @test */
    public function it_returns_true_if_stock_already_updated()
    {
        // Create a real Order object - no mocking needed
        $order = new Order();
        $order->stock_updated = true;
        $order->id = 123;
        $order->order_number = 'ORD-001';

        $service = new OrderStockService();
        $result = $service->deductStockFromOrder($order);

        $this->assertTrue($result);
    }

    /** @test */
    public function it_returns_false_for_unpaid_order()
    {
        // Create a real Order object - no mocking needed
        $order = new Order();
        $order->stock_updated = false;
        $order->payment_status = 'pending';
        $order->id = 123;
        $order->order_number = 'ORD-001';

        $service = new OrderStockService();
        $result = $service->deductStockFromOrder($order);

        $this->assertFalse($result);
    }

    /** @test */
    public function it_returns_false_for_unpaid_order_without_order_number()
    {
        // Create a real Order object - no mocking needed
        $order = new Order();
        $order->stock_updated = false;
        $order->payment_status = 'pending';
        $order->id = 123;

        $service = new OrderStockService();
        $result = $service->deductStockFromOrder($order);
        
        $this->assertFalse($result);
    }

    /** @test */
    public function it_returns_false_for_order_with_no_items()
    {
        // Create a real Order object with test data
        $order = new Order();
        $order->stock_updated = false;
        $order->payment_status = 'paid';
        $order->id = 123;
        $order->order_number = 'ORD-001';
        $order->items = [];

        $service = new OrderStockService();
        $result = $service->deductStockFromOrder($order);
        
        $this->assertFalse($result);
    }

    /** @test */
    public function it_returns_false_when_insufficient_stock()
    {
        // Create a real Order object with test data
        $order = new Order();
        $order->stock_updated = false;
        $order->payment_status = 'paid';
        $order->id = 123;
        $order->order_number = 'ORD-001';
        $order->items = [
            ['product_id' => 'prod1', 'quantity' => 5, 'size' => 'M']
        ];

        $service = Mockery::mock(OrderStockService::class)->makePartial();
        $service->shouldReceive('checkStockAvailability')->andReturn(false);

        $result = $service->deductStockFromOrder($order);
        
        $this->assertFalse($result);
    }

    /** @test */
    // public function it_successfully_deducts_stock_for_paid_order()
    // {
    //     $order = Mockery::mock(Order::class);
    //     $order->stock_updated = false;
    //     $order->payment_status = 'paid';
    //     $order->id = 123;
    //     $order->order_number = 'ORD-001';
    //     
    //     $order->shouldReceive('setAttribute')->passthru();
    //     $order->shouldReceive('getAttribute')->passthru();

    //     $items = [
    //         ['product_id' => 'prod1', 'quantity' => 2, 'size' => 'M'],
    //         ['product_id' => 'prod2', 'quantity' => 1, 'size' => 'L']
    //     ];

    //     $service = Mockery::mock(OrderStockService::class)->makePartial();
    //     $service->shouldReceive('getOrderItems')->andReturn($items);
    //     $service->shouldReceive('checkStockAvailability')->andReturn(true);
    //     $service->shouldReceive('deductStockForItems')->andReturn(true);
    //     $service->shouldReceive('markOrderStockUpdated')->andReturn(true);

    //     DB::shouldReceive('beginTransaction')->once();
    //     DB::shouldReceive('commit')->once();

    //     $result = $service->deductStockFromOrder($order);
    //     
    //     $this->assertTrue($result);
    // }

    /** @test */
    // public function it_handles_database_transaction_rollback_on_failure()
    // {
    //     $order = Mockery::mock(Order::class);
    //     $order->stock_updated = false;
    //     $order->payment_status = 'paid';
    //     $order->id = 123;
    //     $order->order_number = 'ORD-001';
    //     
    //     // Allow setAttribute calls for property assignment
    //     $order->shouldReceive('setAttribute')->passthru();
    //     $order->shouldReceive('getAttribute')->passthru();

    //     $items = [
    //         ['product_id' => 'prod1', 'quantity' => 2, 'size' => 'M']
    //     ];

    //     $service = Mockery::mock(OrderStockService::class)->makePartial();
    //     $service->shouldReceive('getOrderItems')->andReturn($items);
    //     $service->shouldReceive('checkStockAvailability')->andReturn(true);
    //     $service->shouldReceive('deductStockForItems')->andThrow(new \Exception('Stock update failed'));

    //     DB::shouldReceive('beginTransaction')->once();
    //     DB::shouldReceive('rollBack')->once();

    //     $result = $service->deductStockFromOrder($order);
    //     
    //     $this->assertFalse($result);
    // }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }
}
