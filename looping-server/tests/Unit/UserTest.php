<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\User;
use App\Models\Address;
use Illuminate\Foundation\Testing\RefreshDatabase;

class UserTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_can_create_a_user()
    {
        $user = new User();
        $user->name = 'John Doe';
        $user->email = 'john@example.com';
        $user->is_admin = false;
        $user->is_verified = false;

        $this->assertEquals('John Doe', $user->name);
        $this->assertEquals('john@example.com', $user->email);
        $this->assertFalse($user->is_admin);
        $this->assertFalse($user->is_verified);
    }

    /** @test */
    public function it_can_create_an_admin_user()
    {
        $user = new User();
        $user->is_admin = true;
        $user->is_verified = true;

        $this->assertTrue($user->is_admin);
        $this->assertTrue($user->is_verified);
    }

    /** @test */
    public function it_has_many_addresses()
    {
        $user = new User();
        
        // Test that the addresses method exists and returns a relationship
        $addressesRelation = $user->addresses();
        
        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Relations\HasMany::class, $addressesRelation);
        $this->assertEquals('user_id', $addressesRelation->getForeignKeyName());
    }

    /** @test */
    public function it_returns_correct_email_for_verification()
    {
        $user = new User();
        $user->email = 'test@example.com';
        
        $this->assertEquals('test@example.com', $user->getEmailForVerification());
    }

    /** @test */
    public function it_uses_correct_fillable_fields()
    {
        $userData = [
            'name' => 'Jane Doe',
            'email' => 'jane@example.com',
            'is_admin' => false,
            'is_verified' => true,
            'type' => 'customer',
        ];

        $user = new User();
        $user->fill($userData);

        foreach ($userData as $key => $value) {
            $this->assertEquals($value, $user->$key);
        }
    }
}
