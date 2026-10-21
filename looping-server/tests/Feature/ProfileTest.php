<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_profile_page_is_displayed(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->get('/profile');

        $response->assertOk();
    }

    public function test_profile_information_can_be_updated(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->put('/profile', [
                'name' => 'Test User',
                'email' => 'test@example.com',
            ]);

        $response
            ->assertStatus(200)
            ->assertJson([
                'name' => 'Test User',
                'email' => 'test@example.com',
            ]);

        // Check the Profile model, not the User model
        $profile = \App\Models\Profile::firstWhere('email', 'test@example.com');
        $this->assertSame('Test User', $profile->name);
        $this->assertSame('test@example.com', $profile->email);
    }

    public function test_email_verification_status_is_unchanged_when_the_email_address_is_unchanged(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->put('/profile', [
                'name' => 'Test User',
                'email' => $user->email,
            ]);

        $response
            ->assertStatus(200)
            ->assertJson([
                'name' => 'Test User',
                'email' => $user->email,
            ]);

        // Check the Profile model, not the User model
        $profile = \App\Models\Profile::firstWhere('email', $user->email);
        $this->assertSame('Test User', $profile->name);
        $this->assertSame($user->email, $profile->email);
        $this->assertNotNull($user->refresh()->email_verified_at);
    }

    public function test_user_can_delete_their_account(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->delete('/profile', [
                'password' => 'password',
            ]);

        $response
            ->assertStatus(200)
            ->assertJson([
                'message' => 'Account deleted',
            ]);

        // The most important test: verify the user is actually deleted
        $this->assertNull($user->fresh());
    }

    public function test_correct_password_must_be_provided_to_delete_account(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->from('/profile')
            ->delete('/profile', [
                'password' => 'wrong-password',
            ]);

        $response
            ->assertStatus(422)
            ->assertJson([
                'message' => 'Invalid password',
            ]);

        $this->assertNotNull($user->fresh());
    }
}
