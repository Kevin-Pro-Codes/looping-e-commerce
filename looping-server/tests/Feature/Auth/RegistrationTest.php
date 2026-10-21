<?php

namespace Tests\Feature\Auth;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_new_users_can_register(): void
    {
        $response = $this->post('/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        // The controller returns JSON but doesn't authenticate the user
        $response->assertStatus(200);
        $response->assertJson([
            'message' => 'Registration successful. Check your email for verification link.'
        ]);
        
        // Assert the user was created but not authenticated
        $this->assertGuest();
        $this->assertDatabaseHas('users', [
            'email' => 'test@example.com',
            'name' => 'Test User',
            'is_verified' => false,
        ]);
    }
}
