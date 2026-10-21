<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;

class SimpleTest extends TestCase
{
    /** @test */
    public function it_asserts_true()
    {
        $this->assertTrue(true);
    }

    /** @test */
    public function it_asserts_equals()
    {
        $this->assertEquals(2, 1 + 1);
    }

    /** @test */
    public function it_asserts_string_contains()
    {
        $this->assertStringContainsString('test', 'this is a test');
    }
}
