<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;
use App\Services\OrderStockService;

class OrderStockServiceTestClean extends TestCase
{
    private OrderStockService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new OrderStockService();
    }

    /** @test */
    public function it_can_be_instantiated()
    {
        $this->assertInstanceOf(OrderStockService::class, $this->service);
    }

    /** @test */
    public function it_has_deduct_stock_method()
    {
        $this->assertTrue(
            method_exists($this->service, 'deductStockFromOrder'),
            'OrderStockService should have deductStockFromOrder method'
        );
    }

    /** @test */
    public function it_checks_service_class_exists()
    {
        $this->assertTrue(class_exists('App\Services\OrderStockService'));
    }

    /** @test */
    public function it_checks_order_model_exists()
    {
        $this->assertTrue(class_exists('App\Models\Order'));
    }

    /** @test */
    public function it_checks_stock_model_exists()
    {
        $this->assertTrue(class_exists('App\Models\Stock'));
    }
}
