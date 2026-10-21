<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;
use App\Models\Product;

class ProductTestClean extends TestCase
{
    /** @test */
    public function it_can_create_product_instance()
    {
        $product = new Product();
        
        $this->assertInstanceOf(Product::class, $product);
    }

    /** @test */
    public function it_has_correct_connection()
    {
        $product = new Product();
        $this->assertEquals('mongodb', $product->getConnectionName());
    }

    /** @test */
    public function it_has_string_key_type()
    {
        $product = new Product();
        $this->assertEquals('string', $product->getKeyType());
    }

    /** @test */
    public function it_disables_auto_incrementing()
    {
        $product = new Product();
        $this->assertFalse($product->incrementing);
    }

    /** @test */
    public function it_has_fillable_fields()
    {
        $product = new Product();
        $expectedFillable = [
            '_id',
            'title',
            'price',
            'image',
            'description',
            'category',
        ];
        
        $this->assertEquals($expectedFillable, $product->getFillable());
    }

    /** @test */
    public function it_can_set_and_get_properties()
    {
        $product = new Product();
        
        $product->_id = 'test-id-' . uniqid();
        $product->title = 'Test Product';
        $product->price = 99.99;
        $product->category = 'electronics';
        $product->description = 'Test description';
        $product->image = 'test.jpg';

        $this->assertEquals('Test Product', $product->title);
        $this->assertEquals(99.99, $product->price);
        $this->assertEquals('electronics', $product->category);
        $this->assertEquals('Test description', $product->description);
        $this->assertEquals('test.jpg', $product->image);
    }

    /** @test */
    public function it_checks_meilisearch_methods_exist()
    {
        $product = new Product();
        
        $this->assertTrue(
            method_exists($product, 'indexInMeilisearch'),
            'Product should have indexInMeilisearch method'
        );
        
        $this->assertTrue(
            method_exists($product, 'searchProducts'),
            'Product should have searchProducts method'
        );
        
        $this->assertTrue(
            method_exists($product, 'indexSingleProduct'),
            'Product should have indexSingleProduct method'
        );
        
        $this->assertTrue(
            method_exists($product, 'removeFromMeilisearch'),
            'Product should have removeFromMeilisearch method'
        );
    }

    /** @test */
    public function it_checks_product_model_exists()
    {
        $this->assertTrue(class_exists('App\Models\Product'));
    }
}
