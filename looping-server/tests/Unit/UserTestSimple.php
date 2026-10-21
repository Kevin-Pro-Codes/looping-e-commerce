<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;
use App\Models\User;

class UserTestSimple extends TestCase
{
    /** @test */
    public function it_can_create_a_user_instance()
    {
        $user = new User();
        
        $user->name = 'John Doe';
        $user->email = 'john@example.com';
        $user->is_admin = false;
        $user->is_verified = true;
        $user->type = 'customer';

        $this->assertEquals('John Doe', $user->name);
        $this->assertEquals('john@example.com', $user->email);
        $this->assertFalse($user->is_admin);
        $this->assertTrue($user->is_verified);
        $this->assertEquals('customer', $user->type);
    }

    /** @test */
    public function it_can_create_an_admin_user_instance()
    {
        $user = new User();
        
        $user->name = 'Admin User';
        $user->email = 'admin@example.com';
        $user->is_admin = true;
        $user->is_verified = true;
        $user->type = 'admin';

        $this->assertTrue($user->is_admin);
        $this->assertTrue($user->is_verified);
        $this->assertEquals('admin', $user->type);
    }

    /** @test */
    public function it_returns_correct_email_for_verification()
    {
        $user = new User();
        $user->email = 'test@example.com';
        
        $this->assertEquals('test@example.com', $user->getEmailForVerification());
    }

    /** @test */
    public function it_has_correct_fillable_fields()
    {
        $user = new User();
        $expectedFillable = [
            'google_id',
            'name',              
            'email', 
            'is_verified',
            'is_admin',   
            'email_verified_at',
            'password',
            'remember_token',
            'created_at',
            'updated_at',
            'type',
        ];
        
        $this->assertEquals($expectedFillable, $user->getFillable());
    }
}
